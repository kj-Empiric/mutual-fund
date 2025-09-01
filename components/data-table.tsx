"use client";

import * as React from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Search,
  Filter,
} from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumn?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showPagination?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchPlaceholder = "Search...",
  showSearch = true,
  showPagination = true,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Search Bar - Mobile Optimized */}
      {showSearch && searchColumn && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={
                (table.getColumn(searchColumn)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(searchColumn)
                  ?.setFilterValue(event.target.value)
              }
              className="w-full pl-10 pr-4 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors"
            />
          </div>
        </motion.div>
      )}

      {/* Table Container - Mobile Responsive */}
      <div className="rounded-lg border border-border/50 overflow-hidden bg-card/30 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        className="whitespace-nowrap px-3 py-4 text-left"
                      >
                        {header.isPlaceholder ? null : (
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className={
                              header.column.getCanSort()
                                ? "flex items-center cursor-pointer select-none group"
                                : undefined
                            }
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            <span className="font-semibold text-sm">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </span>
                            {header.column.getCanSort() && (
                              <motion.span
                                className="ml-2 flex items-center text-muted-foreground group-hover:text-foreground transition-colors"
                                animate={{
                                  rotate:
                                    header.column.getIsSorted() === "asc"
                                      ? 0
                                      : header.column.getIsSorted() === "desc"
                                        ? 180
                                        : 0,
                                }}
                                transition={{ duration: 0.2 }}
                              >
                                {header.column.getIsSorted() ? (
                                  <ArrowUp className="h-4 w-4" />
                                ) : (
                                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                                )}
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row, index) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-4">
                          <div className="flex items-center">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </div>
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-32 text-center"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center justify-center space-y-2"
                      >
                        <Filter className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          No results found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search criteria
                        </p>
                      </motion.div>
                    </TableCell>
                  </TableRow>
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Mobile Optimized */}
      {showPagination && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2"
        >
          {/* Rows per page */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-muted-foreground">
              Rows per page
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-9 w-[70px] bg-background/50 backdrop-blur-sm border-border/50">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent
                side="top"
                className="bg-background/95 backdrop-blur-sm border-border/50"
              >
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Page navigation */}
          <div className="flex items-center space-x-4">
            <motion.div
              key={table.getState().pagination.pageIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-sm font-medium text-muted-foreground"
            >
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </motion.div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="h-9 px-3 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-colors"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="h-9 px-3 bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/80 transition-colors"
              >
                Next
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
