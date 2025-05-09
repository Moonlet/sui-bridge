import { Box, ButtonGroup, Button, Switch, FormControlLabel } from '@mui/material'
import { TimeInterval, getTimeIntervalForPeriod, TimePeriod } from 'src/config/helper'
import { ChartSelect } from './chart-select'

export function ChartActionButtons({
    showTotal,
    setShowTotal,
    selectedSeries,
    handleChangeSeries,
    timePeriod,
}: {
    showTotal: boolean
    setShowTotal: (value: boolean) => void
    selectedSeries: TimeInterval
    handleChangeSeries: (newValue: string) => void
    timePeriod: string
}) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' }, // Column on mobile, row on larger screens
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: { xs: 'flex-end', sm: 'flex-start' }, // Align to the right on mobile
                gap: 1,
            }}
        >
            <ButtonGroup
                sx={{
                    mr: { sm: 2 },
                    width: { xs: 'auto', sm: 'auto' },
                    height: 34,
                    alignSelf: { xs: 'flex-end', sm: 'flex-start' }, // Align to the right on mobile
                }}
            >
                <Button
                    variant={!showTotal ? 'contained' : 'outlined'}
                    onClick={() => setShowTotal(false)}
                    sx={{ width: 100 }}
                >
                    Per Asset
                </Button>
                <Button
                    variant={showTotal ? 'contained' : 'outlined'}
                    onClick={() => setShowTotal(true)}
                    sx={{ width: 100 }}
                >
                    Total
                </Button>
            </ButtonGroup>
            <ChartSelect
                options={getTimeIntervalForPeriod(timePeriod as TimePeriod)}
                value={selectedSeries}
                onChange={handleChangeSeries}
                slotProps={{
                    button: {
                        width: 100,
                        alignSelf: { xs: 'flex-end', sm: 'center' }, // Align to the right on mobile
                        justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                    },
                }}
            />
        </Box>
    )
}
