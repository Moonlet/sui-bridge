import {
    CardProps,
    Card,
    CardHeader,
    Table,
    TableBody,
    Divider,
    TablePagination,
    Box,
    Skeleton,
    TableCell,
    TableRow,
} from '@mui/material'
import { Scrollbar } from '../scrollbar'
import { TableHeadCustom } from './table-head-custom'
import React, { ComponentType, FC, ReactElement, ReactNode } from 'react'

type RowComponentProps<T> = {
    row: T
}

type Props<T> = CardProps & {
    title?: ReactNode | any
    subheader?: string
    headLabel: { id: string; label: string }[]
    tableData: T[]
    RowComponent: ComponentType<RowComponentProps<T>>
    hidePagination?: boolean
    loading?: boolean
    rowHeight?: number
    pagination?: {
        count: number
        page: number
        rowsPerPage: number
        onPageChange: (newPage: number) => void
    }
}

export function CustomTable<T>({
    title,
    subheader,
    tableData,
    headLabel,
    rowHeight,
    RowComponent,
    loading,
    hidePagination,
    pagination,
    ...other
}: Props<T>) {
    return (
        <Card {...other} sx={{ mt: 4 }}>
            <CardHeader title={title} subheader={subheader} sx={{ mb: 3 }} />

            <Scrollbar sx={{ minHeight: 462 }}>
                <Table sx={{ width: '100%', tableLayout: 'fixed', minWidth: 720 }}>
                    <TableHeadCustom headLabel={headLabel} />
                    <TableBody>
                        {loading
                            ? Array.from(new Array(10)).map((_, index) => (
                                  <SkeletonRow
                                      rowHeight={rowHeight}
                                      key={index}
                                      columnCount={headLabel?.length}
                                  />
                              ))
                            : tableData.map((row, index) => (
                                  <RowComponent key={(row as any).id || index} row={row} />
                              ))}
                    </TableBody>
                </Table>
            </Scrollbar>

            <Divider sx={{ borderStyle: 'dashed' }} />

            {!hidePagination && pagination ? (
                <Box sx={{ p: 2 }}>
                    <TablePagination
                        rowsPerPageOptions={[pagination.rowsPerPage]}
                        component="div"
                        count={pagination.count}
                        rowsPerPage={pagination.rowsPerPage}
                        page={pagination.page}
                        onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
                    />
                </Box>
            ) : null}
        </Card>
    )
}

const SkeletonRow: FC<{ columnCount: number; rowHeight?: number }> = ({
    columnCount,
    rowHeight,
}) => {
    return (
        <TableRow sx={{ height: rowHeight || null }}>
            {Array.from({ length: columnCount }).map((_, index) => (
                <TableCell key={index}>
                    <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 2 }} />
                </TableCell>
            ))}
        </TableRow>
    )
}
