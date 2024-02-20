// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import BN from 'bn.js';
import React, { FC } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import { useNetworkSelector } from '~src/redux/selectors';
import { ResponsivePie } from '@nivo/pie';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { Card } from 'antd';
import { useTheme } from 'next-themes';

interface IVotesTurnoutProps {
	activeIssuance: BN;
	totalIssuance: BN;
	className?: string;
}

const VotesTurnoutCard: FC<IVotesTurnoutProps> = ({ activeIssuance, totalIssuance, className }) => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const bnToIntBalance = function (bn: BN): number {
		return Number(formatBnBalance(bn, { numberAfterComma: 6, withThousandDelimitor: false }, network));
	};

	const turnoutPercentage = (bnToIntBalance(activeIssuance) / bnToIntBalance(totalIssuance)) * 100;

	const turnoutColor = '#796EEC';
	const issuanceColor = '#B6B0FB';

	const chartData = [
		{
			color: turnoutColor,
			id: 'turnout',
			label: 'Turnout',
			value: bnToIntBalance(activeIssuance)
		},
		{
			color: issuanceColor,
			id: 'issuance',
			label: 'Issuance',
			value: bnToIntBalance(new BN(totalIssuance).sub(new BN(activeIssuance)))
		}
	];
	return (
		<Card className='mx-auto h-fit max-h-[500px] w-full flex-1 rounded-xxl bg-white p-0 drop-shadow-md dark:bg-section-dark-overlay dark:text-white lg:max-w-[512px]'>
			<h2 className='text-xl font-semibold'>Turnout Percentage</h2>
			<div className={`${className} relative -mt-4 flex h-[180px] items-center justify-center gap-x-2 lg:-mt-7`}>
				<ResponsivePie
					data={chartData}
					margin={{ bottom: 0, left: 5, right: 5, top: 0 }}
					startAngle={-90}
					endAngle={90}
					innerRadius={0.85}
					padAngle={2}
					cornerRadius={45}
					activeOuterRadiusOffset={5}
					borderWidth={1}
					colors={({ data }) => data.color}
					borderColor={{
						from: 'color',
						modifiers: [['darker', 0.2]]
					}}
					enableArcLabels={false}
					enableArcLinkLabels={false}
					legends={[
						{
							anchor: 'bottom',
							direction: 'row',
							effects: [
								{
									on: 'hover',
									style: {
										itemTextColor: '#808080'
									}
								}
							],
							itemDirection: 'left-to-right',
							itemHeight: 19,
							itemOpacity: 1,
							itemTextColor: theme === 'dark' ? '#fff' : '#576D8B',
							itemWidth: 85,
							itemsSpacing: 0,
							justify: false,
							symbolShape: 'circle',
							symbolSize: 6,
							translateX: 20,
							translateY: -10
						}
					]}
					theme={{
						tooltip: {
							container: {
								background: theme === 'dark' ? '#1E2126' : '#fff',
								color: theme === 'dark' ? '#fff' : '#576D8B',
								fontSize: 11,
								textTransform: 'capitalize'
							}
						}
					}}
					valueFormat={(value) => formatUSDWithUnits(value.toString(), 1)}
				/>
				<p className='absolute bottom-5 block gap-2 text-2xl font-bold dark:text-white'>{turnoutPercentage ? `${turnoutPercentage.toFixed(1)}%` : ''}</p>
			</div>
		</Card>
	);
};

export default VotesTurnoutCard;
