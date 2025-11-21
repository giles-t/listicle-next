# Lazy Load Fix for Edit Page

## Problem
On the list edit page, editing a list item with an embed caused:
1. **Page jumping** (layout shift)
2. **Other embeds reloading** unnecessarily

This happened because the `LazyEmbed` component was re-rendering when the parent component updated, resetting its state and causing embeds to reload.

## Solution

### 1. ✅ Memoized LazyEmbed Component
Wrapped `LazyEmbed` with `React.memo()` to prevent unnecessary re-renders when props haven't changed.

```tsx
export const LazyEmbed = memo(function LazyEmbed({ ... }) {
  // Component logic
});
```

### 2. ✅ Prevented Duplicate Loading
Added a ref to track which HTML has been loaded to prevent reloading the same embed:

```tsx
const htmlLoadedRef = useRef<string | null>(null);

useEffect(() => {
  // Don't reload if we've already loaded this exact HTML
  if (htmlLoadedRef.current === html) return;
  
  // Load embed...
  htmlLoadedRef.current = html;
}, [isInView, html]);
```

### 3. ✅ Added disableLazyLoad Prop
Added option to disable lazy loading entirely for editor contexts:

```tsx
interface LazyEmbedProps {
  // ... other props
  disableLazyLoad?: boolean; // Skip lazy loading if true
}
```

When `disableLazyLoad={true}`:
- Embeds load immediately (no intersection observer)
- State is stable across re-renders
- No page jumping or reloading

### 4. ✅ Updated EditListClient
Edit page now disables lazy loading:

```tsx
<StaticContentRenderer 
  content={item.content} 
  emptyMessage="No details added yet..."
  disableLazyLoad={true}  // ← Prevents reload issues
/>
```

## How It Works Now

### Public List View Page (/@username/list-slug)
```
✅ Lazy loading ENABLED (default)
- Initial load: ~400KB
- Embeds load progressively
- Excellent performance
```

### List Edit Page (/me/list/[id]/edit)
```
✅ Lazy loading DISABLED
- Embeds load immediately
- No reloading on edits
- Stable during content changes
```

## Files Modified

1. ✅ `/src/server/components/LazyEmbed.tsx`
   - Added `memo()` wrapper
   - Added `disableLazyLoad` prop
   - Added HTML tracking to prevent duplicate loads
   - Improved intersection observer cleanup

2. ✅ `/src/server/components/StaticContentRenderer.tsx`
   - Added `disableLazyLoad` prop
   - Created factory function for embed component
   - Passes lazy load setting through to embeds

3. ✅ `/src/app/me/list/[id]/edit/EditListClient.tsx`
   - Added `disableLazyLoad={true}` to StaticContentRenderer

## Testing

### Edit Page (Should be stable now)
1. Open a list with embeds in edit mode
2. Edit a list item (any change)
3. ✅ Other embeds should NOT reload
4. ✅ Page should NOT jump
5. ✅ Editing should feel smooth

### View Page (Should still be performant)
1. Open a published list with many embeds
2. Scroll down the page
3. ✅ Embeds should load progressively
4. ✅ Initial page load should be fast

## Performance Impact

### Edit Page
- **Before**: Embeds reload on every edit (janky)
- **After**: Embeds stay loaded (smooth) ✅

### View Page
- **No change**: Still uses lazy loading for optimal performance ✅

## Technical Details

### Why Memoization Helps
`React.memo()` prevents the component from re-rendering unless its props actually change. This is crucial because:

1. Edit page re-renders frequently (on every keystroke)
2. Without memo, LazyEmbed would reset state on each render
3. With memo, LazyEmbed only updates when its specific props change

### Why HTML Tracking Helps
The `htmlLoadedRef` prevents reloading the same embed content:

```tsx
// Without tracking:
Edit item → Parent re-renders → LazyEmbed effect runs → Embed reloads 😞

// With tracking:
Edit item → Parent re-renders → LazyEmbed checks ref → Same HTML → Skip reload 😊
```

### Why disableLazyLoad for Edit Page
The edit page doesn't need lazy loading because:
1. Not high-traffic (authenticated users only)
2. Users are actively working with content
3. Fewer items visible at once
4. Stability > Performance for editing UX

## Future Improvements

Could consider:
1. **Smart memoization** - Only disable lazy load for currently editing item
2. **Debounced re-renders** - Batch updates to reduce re-render frequency
3. **Virtual scrolling** - For lists with 50+ items in edit mode

## Summary

✅ **Edit page**: Stable, no more reloading, smooth editing
✅ **View page**: Still fast, lazy loading preserved
✅ **No breaking changes**: Backward compatible
✅ **SEO**: Unaffected, still server-rendered

