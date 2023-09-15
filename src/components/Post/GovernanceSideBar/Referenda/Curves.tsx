// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LoadingOutlined } from '@ant-design/icons';
import React, { FC, memo } from 'react';
import * as Chart from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Spin } from 'antd';
import ChartIcon from '~assets/chart-icon.svg';
import AyeApprovalIcon from '~assets/chart-aye-current-approval.svg';
import AyeThresholdIcon from '~assets/chart-aye-threshold.svg';
import NayApprovalIcon from '~assets/chart-nay-current-approval.svg';
import NayThresholdIcon from '~assets/chart-nay-threshold.svg';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface IProgress {
	approval: number;
	approvalThreshold: number;
	support: number;
	supportThreshold: number;
}

interface ICurvesProps {
	data: {
		datasets: any[];
		labels: any[];
	};
	progress: IProgress;
	curvesLoading: boolean;
	curvesError: string;
	setData: React.Dispatch<any>;
}

const Curves: FC<ICurvesProps> = (props) => {
	const { data, progress, curvesError, curvesLoading, setData } = props;
	const toggleData = (index: number) => {
		setData((prev: any) => {
			if (prev.datasets && Array.isArray(prev.datasets) && prev.datasets.length > index) {
				const datasets = [
					...prev.datasets.map((dataset: any, i: any) => {
						if (dataset && index === i) {
							return {
								...dataset,
								borderColor: dataset.borderColor === 'transparent' ? ([0, 2].includes(i) ? '#5BC044' : '#E5007A') : 'transparent'
							};
						}
						return { ...dataset };
					})
				];
				return {
					...prev,
					datasets: datasets
				};
			}
			return {
				...prev
			};
		});
	};
	const labelsLength = data.labels.length;
	return (
		<Spin
			indicator={<LoadingOutlined />}
			spinning={curvesLoading}
		>
			{curvesError ? (
				<p className='text-center font-medium text-red-500'>{curvesError}</p>
			) : (
				<section>
					{progress.approval >= progress.approvalThreshold && progress.support >= progress.supportThreshold ? (
						<p className='row mb-2 flex items-center gap-1 text-sm font-medium'>
							<ChartIcon />
							<p className='m-0'>
								Proposal has <span className='text-aye_green'>passed</span> as both support and approval are above the threshold
							</p>
						</p>
					) : (
						<p className='row mb-2 flex items-center gap-1 text-sm font-medium text-bodyBlue'>
							<ChartIcon />
							<p className='m-0'>
								Proposal has <span className='text-nay_red'>failed</span> as both support and approval are below the threshold
							</p>
						</p>
					)}
					<article className='-mx-3 md:m-0'>
						<Chart.Line
							className='h-full w-full'
							data={data}
							plugins={[hoverLinePlugin]}
							options={{
								animation: {
									duration: 0
								},
								clip: false,
								plugins: {
									hoverLine: {
										lineColor: '#0F0F',
										lineWidth: 1
									},
									legend: {
										display: false,
										position: 'bottom'
									},
									tooltip: {
										callbacks: {
											label(tooltipItem: any) {
												const { dataIndex, parsed, dataset } = tooltipItem;

												// only display one item
												if (['Approval', 'Current Approval'].includes(dataset.label)) {
													return '';
												}

												if (dataset.label === 'Current Support') {
													const currentApproval = data.datasets[2].data[dataIndex];
													const currentSupport = data.datasets[3].data[dataIndex];
													const currentApprovalValue = Number(typeof currentApproval === 'object' ? currentApproval.y : currentApproval).toFixed(2);
													const currentSupportValue = Number(typeof currentSupport === 'object' ? currentSupport.y : currentSupport).toFixed(2);
													return `Current Support: ${currentSupportValue}% Current Approval: ${currentApprovalValue}%`;
												}

												const hs = parsed.x;
												const approval = data.datasets[0].data[dataIndex];
												const support = data.datasets[1].data[dataIndex];
												const approvalValue = Number(typeof approval === 'object' ? approval.y : approval).toFixed(2);
												const supportValue = Number(typeof support === 'object' ? support.y : support).toFixed(2);

												const result = `Time: ${(hs / 60).toFixed(0)}hs Support: ${supportValue}% Approval: ${approvalValue}%`;

												return result;
											},
											title() {
												return '';
											}
										},
										displayColors: false,
										intersect: false,
										mode: 'index'
									}
								} as any,
								scales: {
									x: {
										beginAtZero: false,
										display: true,
										grid: {
											display: true,
											drawOnChartArea: false
										},
										ticks: {
											callback(v: any) {
												return (v / (60 * 24)).toFixed(0);
											},
											max: labelsLength,
											stepSize: Math.round(labelsLength / (labelsLength / (60 * 24)))
										} as any,
										title: {
											display: true,
											font: {
												size: window.innerWidth < 400 ? 10 : 12,
												weight: window.innerWidth > 400 ? '500' : '400'
											},
											text: 'Days'
										},
										type: 'linear'
									},
									y: {
										beginAtZero: false,
										display: true,
										max: 100,
										min: 0,
										ticks: {
											callback(val: any) {
												return val + '%';
											},
											stepSize: 10
										},
										title: {
											display: true,
											font: {
												size: window.innerWidth < 400 ? 10 : 12,
												weight: window.innerWidth > 400 ? '500' : '400'
											},
											text: 'Passing Percentage'
										}
									}
								}
							}}
						/>
					</article>
					<article className='mt-3 flex items-center justify-center gap-x-3 xs:gap-x-5'>
						<button
							onClick={() => {
								toggleData(1);
							}}
							className='flex cursor-pointer flex-col justify-center border-none bg-transparent outline-none'
						>
							<span className='h-1 w-[32px] border-0 border-t border-solid border-[#E5007A]'></span>
							<span className='text-[8px] font-normal leading-[12px] text-sidebarBlue sm:text-[10px]'>Support</span>
						</button>
						<button
							onClick={() => {
								toggleData(3);
							}}
							className='flex cursor-pointer flex-col justify-center border-none bg-transparent outline-none'
						>
							<span className='h-1 w-[32px] border-0 border-t border-dashed border-[#E5007A]'></span>
							<span className='text-[8px] font-normal leading-[12px] text-sidebarBlue sm:text-[10px]'>Current Support</span>
						</button>
						<button
							onClick={() => {
								toggleData(0);
							}}
							className='flex cursor-pointer flex-col justify-center border-none bg-transparent outline-none'
						>
							<span className='h-1 w-[32px] border-0 border-t border-solid border-[#5BC044]'></span>
							<span className='text-[8px] font-normal leading-[12px] text-sidebarBlue sm:text-[10px]'>Approval</span>
						</button>
						<button
							onClick={() => {
								toggleData(2);
							}}
							className='flex cursor-pointer flex-col justify-center border-none bg-transparent outline-none'
						>
							<span className='h-1 w-[32px] border-0 border-t border-dashed border-[#5BC044]'></span>
							<span className='text-[8px] font-normal leading-[12px] text-sidebarBlue sm:text-[10px]'>Current Approval</span>
						</button>
					</article>
					<article className='mt-5 flex flex-col items-center gap-3 gap-x-2 sm:flex-row'>
						<div className='w-full rounded-[5px] border border-solid border-[#68D183] bg-[#68D18330] px-3 py-2 shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
							<p className='m-0 flex items-center justify-between gap-x-2 text-[10px] leading-3 text-[#334D6E]'>
								<span className='flex items-center gap-[6px] text-xs font-medium text-bodyBlue'>
									<span>
										<AyeApprovalIcon />
									</span>
									Current Approval
								</span>
								<span className='flex items-center gap-1 text-xs font-medium text-bodyBlue'>{progress.approval}%</span>
							</p>
							<p className='m-0 flex items-center justify-between gap-x-2 p-0 text-[10px] leading-3 text-[#334D6E]'>
								<span className='flex items-center gap-[6px] text-xs font-medium text-bodyBlue'>
									<span>
										<AyeThresholdIcon />
									</span>
									Threshold
								</span>
								<span className='flex items-center gap-1 text-xs font-medium text-bodyBlue'>{progress.approvalThreshold && progress.approvalThreshold.toFixed(1)}%</span>
							</p>
						</div>
						<div className='w-full rounded-[5px] border border-solid border-[#E5007A] bg-[#FFF5FB] px-3 py-2 shadow-[0px_6px_10px_rgba(0,0,0,0.06)]'>
							<p className='m-0 flex items-center justify-between gap-x-2 text-[10px] leading-3 text-[#334D6E]'>
								<span className='flex items-center gap-[6px] text-xs font-medium text-bodyBlue'>
									<span>
										<NayApprovalIcon />
									</span>
									Current Support
								</span>
								<span className='flex items-center gap-1 text-xs font-medium text-bodyBlue'>{progress.support}%</span>
							</p>
							<p className='m-0 flex items-center justify-between gap-x-2 p-0 text-[10px] leading-3 text-[#334D6E]'>
								<span className='flex items-center gap-[6px] text-xs font-medium text-bodyBlue'>
									<span>
										<NayThresholdIcon />
									</span>
									Threshold
								</span>
								<span className='flex items-center gap-1 text-xs font-medium text-bodyBlue'>{progress.supportThreshold && progress.supportThreshold.toFixed(1)}%</span>
							</p>
						</div>
					</article>
				</section>
			)}
		</Spin>
	);
};

export default memo(Curves);

const hoverLinePlugin = {
	beforeDraw: (chart: any) => {
		const options = chart.config.options?.plugins?.hoverLine ?? {};

		if (!options) {
			return;
		}

		const { lineWidth, lineColor } = options ?? {};

		if (chart.tooltip._active && chart.tooltip._active.length) {
			const { ctx } = chart;
			ctx.save();

			ctx.beginPath();
			ctx.moveTo(chart.tooltip._active[0].element.x, chart.chartArea.top);
			ctx.lineTo(chart.tooltip._active[0].element.x, chart.chartArea.bottom);
			ctx.lineWidth = lineWidth;
			ctx.strokeStyle = lineColor;
			ctx.stroke();
			ctx.restore();
		}
	},
	id: 'hoverLine'
};
