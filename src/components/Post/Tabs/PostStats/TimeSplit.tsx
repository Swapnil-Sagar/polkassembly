// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';
import { ResponsiveLine } from '@nivo/line';
import BN from 'bn.js';
import { useTheme } from 'next-themes';
import { useNetworkSelector } from '~src/redux/selectors';
import formatUSDWithUnits from 'src/util/formatUSDWithUnits';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from 'src/global/networkConstants';
import { Card } from 'antd';
import styled from 'styled-components';

interface ITimeSplitProps {
	className?: string;
	votesByTimeSplit: any[];
	axisLabel?: string;
	isUsedInAccounts?: boolean;
}

const ZERO = new BN(0);

const TimeSplit: FC<ITimeSplitProps> = ({ className, axisLabel, votesByTimeSplit, isUsedInAccounts }) => {
	const { resolvedTheme: theme } = useTheme();
	const { network } = useNetworkSelector();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const chartData = [
		{
			color: '#4064FF',
			data: [
				...[0, 7, 10, 14, 20, 24, 28].map((x) => ({
					x: x.toString(),
					y: bnToIntBalance(votesByTimeSplit[x] || ZERO) || votesByTimeSplit[x] || 0
				}))
			],
			id: 'votes'
		}
	];

	return (
		<Card className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl border-[#D2D8E0] bg-white p-0 text-blue-light-high dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-white'>
			<h2 className='text-xl font-semibold'>Time Split</h2>
			<div className={`${className} relative -mt-7 flex h-[200px] items-center justify-center gap-x-2`}>
				<ResponsiveLine
					data={chartData}
					margin={{ bottom: 20, left: 50, right: 10, top: 40 }}
					xScale={{ type: 'point' }}
					yScale={{
						max: 'auto',
						min: 'auto',
						reverse: false,
						stacked: true,
						type: 'linear'
					}}
					yFormat=' >-.2f'
					enablePoints={false}
					enableGridX={false}
					colors={['#4064FF']}
					axisTop={null}
					axisRight={null}
					axisLeft={{
						format: (value) => formatUSDWithUnits(value, 1)
					}}
					tooltip={({ point }) => {
						return (
							<div className={`flex gap-2 rounded-md bg-white capitalize dark:bg-[#1E2126] ${theme === 'dark' ? 'text-white' : 'text-[#576D8B]'} p-2 text-[11px] shadow-md`}>
								<span className='text-xs font-semibold'>Days: {point.data.xFormatted}</span>
								<span className='text-xs font-semibold'>
									{axisLabel ? `${axisLabel}: ` : 'votes: '}
									{formatUSDWithUnits(point.data.yFormatted.toString(), 1)} {isUsedInAccounts ? 'voters' : chainProperties[network]?.tokenSymbol}
								</span>
							</div>
						);
					}}
					pointSize={5}
					pointColor={{ theme: 'background' }}
					pointBorderWidth={2}
					pointBorderColor={{ from: 'serieColor' }}
					pointLabelYOffset={-12}
					useMesh={true}
					theme={{
						axis: {
							domain: {
								line: {
									stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
									strokeWidth: 1
								}
							},
							ticks: {
								text: {
									fill: theme === 'dark' ? '#fff' : '#576D8B',
									fontSize: 11,
									outlineColor: 'transparent',
									outlineWidth: 0
								}
							}
						},
						grid: {
							line: {
								stroke: theme === 'dark' ? '#3B444F' : '#D2D8E0',
								strokeDasharray: '2 2',
								strokeWidth: 1
							}
						},
						tooltip: {
							container: {
								background: theme === 'dark' ? '#1E2126' : '#fff',
								color: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11,
								textTransform: 'capitalize'
							}
						}
					}}
				/>
			</div>
		</Card>
	);
};

export default styled(TimeSplit)`
	g[transform='translate(0,0)'] g:nth-child(even) {
		display: none !important;
	}
`;
