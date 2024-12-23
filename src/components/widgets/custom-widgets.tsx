import React, { useEffect, useState } from 'react'
import { Grid, Skeleton } from '@mui/material'
import CardWidget from './card-widgets'
import useSWR from 'swr'
import { endpoints, fetcher } from 'src/utils/axios'
import { fNumber } from 'src/utils/format-number'
import { getNetwork } from 'src/hooks/get-network-storage'
import { useGlobalContext } from 'src/provider/global-provider'
import { calculateCardsTotals } from 'src/utils/helper'

const CustomWidgets: React.FC = () => {
    const network = getNetwork()

    const { selectedTokens, timePeriod } = useGlobalContext()

    const { data, isLoading } = useSWR<any>(
        `${endpoints.cards}?network=${network}&timePeriod=${timePeriod}`,
        fetcher,
    )
    const [totals, setTotals] = useState<
        {
            title: string
            value: any
            color: string
            dollars: boolean
        }[]
    >([])

    useEffect(() => {
        if (data) {
            const formatted = calculateCardsTotals(data, selectedTokens)

            setTotals(formatted)
        }
    }, [selectedTokens, data])
    return (
        <Grid container>
            {isLoading
                ? Array.from(new Array(4)).map((_, index) => (
                      <Grid xs={6} md={4} lg={3} key={index} padding={1}>
                          <CardWidget
                              title={<Skeleton width={180} height={22} />}
                              total={<Skeleton width={140} height={48} />}
                              color={''}
                          />
                      </Grid>
                  ))
                : totals?.map(it => {
                      return (
                          <Grid xs={12} sm={6} md={4} lg={3} key={it?.color} padding={1}>
                              <CardWidget
                                  title={it?.title}
                                  total={`${it?.dollars ? '$' : ''}${fNumber(it?.value)}`}
                                  color={it?.color}
                              />
                          </Grid>
                      )
                  })}
        </Grid>
    )
}

export default CustomWidgets
