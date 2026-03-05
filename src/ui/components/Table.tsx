"use client";

import React from "react";
import { cn } from "../utils";

interface HeaderCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  icon?: React.ReactNode; children?: React.ReactNode; className?: string;
}
const HeaderCell = React.forwardRef<HTMLTableCellElement, HeaderCellProps>(
  function HeaderCell({ icon, children, className, ...otherProps }, ref) {
    return (
      <th className={cn("text-left text-caption-bold font-caption-bold text-subtext-color px-3 py-2", className)} ref={ref} {...otherProps}>
        <div className="flex items-center gap-1">
          {icon ? <span className="shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{icon}</span> : null}
          {children}
        </div>
      </th>
    );
  }
);

interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> { children?: React.ReactNode; className?: string; }
const Cell = React.forwardRef<HTMLTableCellElement, CellProps>(
  function Cell({ children, className, ...otherProps }, ref) {
    return <td className={cn("text-body font-body text-default-font px-3 py-2", className)} ref={ref} {...otherProps}>{children}</td>;
  }
);

interface HeaderRowProps extends React.HTMLAttributes<HTMLTableRowElement> { children?: React.ReactNode; className?: string; }
const HeaderRow = React.forwardRef<HTMLTableRowElement, HeaderRowProps>(
  function HeaderRow({ children, className, ...otherProps }, ref) {
    return <tr className={cn("border-b border-solid border-neutral-border", className)} ref={ref} {...otherProps}>{children}</tr>;
  }
);

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> { clickable?: boolean; children?: React.ReactNode; className?: string; }
const Row = React.forwardRef<HTMLTableRowElement, RowProps>(
  function Row({ clickable = false, children, className, ...otherProps }, ref) {
    return <tr className={cn("border-b border-solid border-neutral-border", { "cursor-pointer hover:bg-neutral-50": clickable }, className)} ref={ref} {...otherProps}>{children}</tr>;
  }
);

interface TableRootProps extends React.HTMLAttributes<HTMLTableElement> { header?: React.ReactNode; children?: React.ReactNode; className?: string; }
const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(
  function TableRoot({ header, children, className, ...otherProps }, ref) {
    return (
      <table className={cn("w-full border-collapse", className)} ref={ref} {...otherProps}>
        {header ? <thead>{header}</thead> : null}
        {children ? <tbody>{children}</tbody> : null}
      </table>
    );
  }
);

export const Table = Object.assign(TableRoot, { Row, Cell, HeaderRow, HeaderCell });
