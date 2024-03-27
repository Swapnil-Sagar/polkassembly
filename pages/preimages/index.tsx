// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Pagination as AntdPagination } from '~src/ui-components/Pagination';
import { Input } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { getPreimages } from 'pages/api/v1/listing/preimages';
import React, { FC, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { LISTING_LIMIT } from '~src/global/listingLimit';
import SEOHead from '~src/global/SEOHead';
import { setNetwork } from '~src/redux/network';
import { IPreimagesListingResponse } from '~src/types';
import { ErrorState } from '~src/ui-components/UIStates';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { handlePaginationChange } from '~src/util/handlePaginationChange';
import styled from 'styled-components';
import { useTheme } from 'next-themes';
import { getSubdomain } from '~src/util/getSubdomain';
import Skeleton from '~src/basic-components/Skeleton';

const PreImagesTable = dynamic(() => import('~src/components/PreImagesTable'), {
	loading: () => <Skeleton active />,
	ssr: false
});

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
	const { page = 1, hash_contains } = query;
	let network = getNetworkFromReqHeaders(req.headers);
	const referer = req.headers.referer;

	let queryNetwork = null;
	if (referer) {
		try {
			const url = new URL(referer);
			queryNetwork = url.searchParams.get('network');
		} catch (error) {
			console.error('Invalid referer URL:', referer, error);
		}
	}
	if (queryNetwork) {
		network = queryNetwork;
	}
	if (query?.network) {
		network = query?.network as string;
	}

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	const { data, error } = await getPreimages({
		hash_contains,
		listingLimit: LISTING_LIMIT,
		network,
		page
	});
	return { props: { data, error, network } };
};

const Pagination = styled(AntdPagination)`
	a {
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#212121')} !important;
	}
	.ant-pagination-item-active {
		background-color: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.anticon-right {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.anticon-left {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
	.ant-pagination-item-ellipsis {
		color: ${(props: any) => (props.theme === 'dark' ? 'white' : '')} !important;
	}
`;

interface IPreImagesProps {
	data?: IPreimagesListingResponse;
	error?: string;
	network: string;
}

const PreImages: FC<IPreImagesProps> = (props: any) => {
	const { data, error, network } = props;
	const dispatch = useDispatch();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [searchQuery, setSearchQuery] = useState<string | number | readonly string[] | undefined>('');

	useEffect(() => {
		router.push({
			pathname: router.pathname,
			query: { ...router.query, hash_contains: '', page: 1 }
		});
		setSearchQuery('');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		const currentUrl = window ? window.location.href : '';
		const subDomain = getSubdomain(currentUrl);
		if (network && ![subDomain]?.includes(network)) {
			router.push({
				query: {
					network: network
				}
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (error) return <ErrorState errorMessage={error} />;
	if (!data) return null;
	const { preimages, count } = data;

	const onSearch = (value: string) => {
		// Update the URL with the new search query
		router.push({
			pathname: router.pathname,
			query: { ...router.query, hash_contains: value, page: 1 }
		});
	};

	const onSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);
	};

	const onPaginationChange = (page: number) => {
		router.push({
			query: {
				page
			}
		});
		handlePaginationChange({ limit: LISTING_LIMIT, page });
	};

	return (
		<>
			<SEOHead
				title='PreImages'
				desc='Discover more about preimages of on chain governance proposals on Polkassembly'
				network={network}
			/>
			<div className='flex justify-between'>
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue dark:text-blue-dark-high'>{count} Preimages</h1>
				<Input.Search
					placeholder='Search Hash'
					onSearch={onSearch}
					value={searchQuery}
					onChange={onSearchInputChange}
					style={{ width: 200 }}
				/>
			</div>

			<div className='rounded-xxl bg-white p-3 shadow-md dark:bg-section-dark-overlay md:p-8'>
				<div>
					<PreImagesTable
						preimages={preimages}
						theme={theme}
					/>

					<div className='mt-6 flex justify-end'>
						{!!preimages && preimages.length > 0 && count && count > 0 && count > LISTING_LIMIT && (
							<Pagination
								theme={theme}
								defaultCurrent={1}
								pageSize={LISTING_LIMIT}
								total={count}
								showSizeChanger={false}
								hideOnSinglePage={true}
								onChange={onPaginationChange}
								responsive={true}
							/>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default PreImages;
