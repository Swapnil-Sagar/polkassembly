// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { SubscriptionsIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import Link from 'next/link';
import { ClockCircleOutlined } from '@ant-design/icons';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { Divider, Spin } from 'antd';
import { ProfileDetailsResponse } from '~src/auth/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getRelativeCreatedAt from '~src/util/getRelativeCreatedAt';

interface Props {
	className?: string;
	userProfile: ProfileDetailsResponse;
}

const ProfileSubscriptions = ({ className, userProfile }: Props) => {
	const { network } = useNetworkSelector();
	const { user_id } = userProfile;
	const { id } = useUserDetailsSelector();
	const [page, setPage] = useState<number>(1);
	const [data, setData] = useState<any>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const getData = async () => {
		setLoading(true);
		try {
			const { data, error } = await nextApiClientFetch<any>('/api/v1/users/subscriptions', {
				page,
				userId: id
			});
			if (data && data?.data) {
				setData(data?.data);
			} else if (error) {
				console.error('Error:', error);
			}
		} catch (error) {
			console.error('Request error:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, page]);
	return (
		<Spin spinning={loading}>
			<div
				className={classNames(
					className,
					'mt-6 flex min-h-[280px] flex-col gap-5 rounded-[14px] border-[1px] border-solid border-[#D2D8E0] bg-white px-6 py-6 text-bodyBlue dark:border-separatorDark dark:bg-section-dark-overlay dark:text-blue-dark-high max-md:flex-col'
				)}
			>
				<div className='flex items-center space-x-1'>
					<SubscriptionsIcon className='active-icon text-[24px] text-lightBlue dark:text-[#9E9E9E]' />
					<span className='ml-2 text-xl font-semibold text-blue-light-high dark:text-blue-dark-high'>Subscriptions</span>
					{/* <span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>(02)</span> */}
				</div>

				{/* Cards */}
				{data.map((item: any, index: number) => {
					const date = new Date(item?.createdAt);
					return (
						<div
							key={index}
							className='p-2'
						>
							<div className='my-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center space-x-1'>
										<span className='text-sm font-semibold text-blue-light-high dark:to-blue-dark-high'>{item.reacted_by}</span>
										<span className='text-xs font-normal text-blue-light-medium dark:text-blue-dark-medium'>subscribed to</span>
									</div>
									{item.createdAt && (
										<>
											<div className=' hidden items-center text-xs text-lightBlue dark:text-icon-dark-inactive sm:flex'>
												<ClockCircleOutlined className='mr-1' /> {getRelativeCreatedAt(date)}
											</div>
										</>
									)}
								</div>
								<div>
									<span className='mr-1 text-xs font-semibold text-blue-light-medium dark:text-blue-dark-medium'>{item.postContent.slice(0, 140)}...</span>
									<Link
										href={`https://${network}.polkassembly.io/${item.postType}/${item.postId}`}
										target='_blank'
									>
										<Image
											src='/assets/icons/redirect.svg'
											alt='redirection-icon'
											width={16}
											height={16}
											className=''
										/>
									</Link>
								</div>
							</div>
							<Divider className='m-0 bg-[#D2D8E0] p-0 dark:bg-separatorDark' />
						</div>
					);
				})}
			</div>
		</Spin>
	);
};

export default ProfileSubscriptions;