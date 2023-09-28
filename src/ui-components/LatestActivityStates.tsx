// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { dayjs } from 'dayjs-init';
import React, { FC, ReactNode } from 'react';

import { IPostsRowData } from '~src/components/Home/LatestActivity/PostsTable';

import Address from './Address';
import StatusTag from './StatusTag';
import { ErrorState, LoadingState, PostEmptyState } from './UIStates';
import { poppins } from 'pages/_app';
import { useTheme } from 'next-themes';

const LatestActivityWrapper = ({ children }: {children: ReactNode}) => (
	<div className="h-[500px] flex items-center justify-center overflow-y-auto">
		{children}
	</div>
);

export const LoadingLatestActivity = () => {
	return (
		<LatestActivityWrapper>
			<LoadingState />
		</LatestActivityWrapper>
	);
};

export const ErrorLatestActivity = ({ errorMessage } : { errorMessage: string}) => {
	return (
		<LatestActivityWrapper>
			<ErrorState errorMessage={errorMessage} />
		</LatestActivityWrapper>
	);
};

export const EmptyLatestActivity = () => {
	return (
		<LatestActivityWrapper>
			<PostEmptyState />
		</LatestActivityWrapper>
	);
};

interface IPopulatedLatestActivityProps {
	columns: ColumnsType<IPostsRowData>;
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

export const PopulatedLatestActivity: FC<IPopulatedLatestActivityProps> = ({ columns, tableData, onClick }) => {
	return (
		<Table
			columns={columns}
			dataSource={tableData}
			pagination={false}
			scroll={{ x: 1000, y: 650 }}

			onRow={(rowData) => {
				return {
					onClick: () => onClick(rowData)
				};
			}}
		/>
	);
};

interface IPopulatedLatestActivityCardProps {
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

interface IGov2PopulatedLatestActivityCardProps {
	tableData: IPostsRowData[];
	onClick: (rowData: IPostsRowData) => any;
}

export const PopulatedLatestActivityCard: FC<IPopulatedLatestActivityCardProps> = ({ tableData, onClick }) => {
	const { resolvedTheme:theme } = useTheme();
	return (
		<div>
			{
				tableData.map((rowData,index) => (
					<div key={rowData.key} className={`${(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-black' : ''} border-2 border-[#DCDFE350] border-solid hover:border-pink_primary hover:shadow-xl transition-all duration-200 h-auto min-h-[140px] ${poppins.variable} ${poppins.className}`} onClick={() => onClick(rowData)}>
						{/* Meta Data Row */}
						<div className="flex items-center justify-between text-blue-light-high dark:text-blue-dark-high m-2.5">
							<div className="max-xs-hidden">
								#{rowData.tip_id ? rowData.tip_id : rowData.post_id} {rowData.title.length > 50 ? rowData.title.substring(0, 50) + '...' : rowData.title}
							</div>
						</div>

						{/* Created by and on */}
						<div className='flex mt-2'>
							<span>
								{
									!rowData.proposer ? <span className='username mx-2 text-blue-light-high dark:text-blue-dark-high font-semibold'> { rowData.username } </span> :
										<Address
											address={rowData.proposer}
											className='text-sm mx-2'
											displayInline={true}
											disableIdenticon={false}
										/>
								}
							</span>
							<Divider type="vertical" className='mt-1 font-normal text-xs border-l-1 border-lightBlue dark:border-blue-dark-medium' />
							<span className='text-lightBlue dark:text-blue-dark-medium mx-1.5 font-normal text-xs'>{rowData.created_at ? dayjs(rowData.created_at).isAfter(dayjs().subtract(1, 'w')) ? dayjs(rowData.created_at).startOf('day').fromNow() : dayjs(rowData.created_at).format('Do MMM \'YY') : null}</span>
						</div>
						{
							rowData.status !== '-' &&
								<div className='flex items-center justify-between my-2 mx-2'>
									<StatusTag theme={theme} className='my-1.5' status={rowData.status} />
								</div>
						}
					</div>
				))
			}
		</div>
	);
};

export const Gov2PopulatedLatestActivityCard: FC<IGov2PopulatedLatestActivityCardProps> = ({ tableData, onClick }) => {
	const { resolvedTheme:theme } = useTheme();
	return (
		<div>
			{
				tableData.map((rowData,index) => (
					<div key={rowData.key} className={`${(index + 1) % 2 !== 0 ? 'bg-[#FBFBFC] dark:bg-black' : ''} border-2 border-[#DCDFE350] border-solid hover:border-pink_primary hover:shadow-xl transition-all duration-200 h-auto min-h-[140px] ${poppins.variable} ${poppins.className}`} onClick={() => onClick(rowData)}>
						{/* Meta Data Row */}
						<div className="flex items-center justify-between text-blue-light-high dark:text-blue-dark-high m-2.5">
							<div className="max-xs-hidden">
								#{rowData.post_id} {rowData.title.length > 50 ? rowData.title.substring(0, 50) + '...' : rowData.title}
								{rowData.sub_title && <div className='text-sm text-blue-light-high dark:text-blue-dark-high'>{rowData.sub_title}
								</div>}
							</div>
						</div>
						{/* Created by and on */}
						<div className='flex mt-2'>
							<span>
								{
									!rowData.proposer ? <span className='username mx-2 text-blue-light-high dark:text-blue-dark-high font-semibold'> { rowData.username } </span> :
										<Address
											address={rowData.proposer}
											className='text-sm mx-2'
											displayInline={true}
											disableIdenticon={false}
										/>
								}
							</span>
							<Divider type="vertical" className='mt-1 font-normal text-xs border-l-1 border-lightBlue dark:border-blue-dark-medium' />
							<span className='text-lightBlue dark:text-blue-dark-medium mx-1.5 font-normal text-xs'>{rowData.created_at ? dayjs(rowData.created_at).isAfter(dayjs().subtract(1, 'w')) ? dayjs(rowData.created_at).startOf('day').fromNow() : dayjs(rowData.created_at).format('Do MMM \'YY') : null}</span>
						</div>
						{
							rowData.status !== '-' &&
								<div className='flex items-center justify-between my-2 mx-2'>
									<StatusTag theme={theme} className='my-1.5' status={rowData.status} />
								</div>
						}
					</div>
				))
			}
		</div>
	);
};