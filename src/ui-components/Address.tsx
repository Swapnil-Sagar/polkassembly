// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { DeriveAccountFlags, DeriveAccountRegistration, DeriveAccountInfo } from '@polkadot/api-derive/types';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import { network as AllNetworks } from '~src/global/networkConstants';
import dayjs from 'dayjs';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getKiltDidName } from '~src/util/kiltDid';
import shortenAddress from '~src/util/shortenAddress';
import EthIdenticon from './EthIdenticon';
import { EAddressOtherTextType } from '~src/types';
import classNames from 'classnames';
import styled from 'styled-components';
import IdentityBadge from './IdentityBadge';
import { Skeleton, Space } from 'antd';
import dynamic from 'next/dynamic';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { ISocial } from '~src/auth/types';
import QuickView, { TippingUnavailableNetworks } from './QuickView';
import { VerifiedIcon } from './CustomIcons';
import Tooltip from '~src/basic-components/Tooltip';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
	loading: () => (
		<Skeleton.Avatar
			active
			size='large'
			shape='circle'
		/>
	),
	ssr: false
});

interface Props {
	address: string;
	className?: string;
	iconSize?: number;
	isSubVisible?: boolean;
	disableHeader?: boolean;
	displayInline?: boolean;
	addressClassName?: string;
	usernameMaxLength?: number;
	addressMaxLength?: number;
	isTruncateUsername?: boolean;
	usernameClassName?: string;
	disableIdenticon?: boolean;
	disableAddressClick?: boolean;
	showFullAddress?: boolean;
	extensionName?: string;
	addressOtherTextType?: EAddressOtherTextType;
	passedUsername?: string;
	ethIdenticonSize?: number;
	isVoterAddress?: boolean;
	disableTooltip?: boolean;
	showKiltAddress?: boolean;
	destroyTooltipOnHide?: boolean;
	inPostHeading?: boolean;
	isProfileView?: boolean;
}

const shortenUsername = (username: string, usernameMaxLength?: number) => {
	if (username.length > 19) {
		return shortenAddress(username, usernameMaxLength || 8);
	}
	return username;
};

const Address = (props: Props) => {
	const {
		className,
		address,
		disableIdenticon = false,
		displayInline,
		iconSize,
		isSubVisible = true,
		showFullAddress,
		addressClassName,
		disableAddressClick = false,
		disableHeader,
		isTruncateUsername = true,
		usernameClassName,
		extensionName,
		usernameMaxLength,
		addressMaxLength,
		addressOtherTextType,
		passedUsername,
		ethIdenticonSize,
		isVoterAddress,
		disableTooltip = false,
		showKiltAddress = false,
		destroyTooltipOnHide = false,
		inPostHeading,
		isProfileView = false
	} = props;
	const { network } = useNetworkSelector();
	const apiContext = useContext(ApiContext);
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const [sub, setSub] = useState<string>('');
	const [identity, setIdentity] = useState<DeriveAccountRegistration>();
	const [flags, setFlags] = useState<DeriveAccountFlags>();
	const [username, setUsername] = useState<string>(passedUsername || '');
	const [kiltName, setKiltName] = useState<string>('');
	const { resolvedTheme: theme } = useTheme();

	const [imgUrl, setImgUrl] = useState<string>('');
	const [profileCreatedAt, setProfileCreatedAt] = useState<Date | null>(null);
	const encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	const [isAutoGeneratedUsername, setIsAutoGeneratedUsername] = useState(true);
	const [open, setOpen] = useState<boolean>(false);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [socials, setSocials] = useState<ISocial[]>([]);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);

	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady, address]);

	const FEATURE_RELEASE_DATE = dayjs('2023-06-12').toDate(); // Date from which we are sending custom username flag on web3 sign up.

	const fetchUsername = async (address: string) => {
		if (isVoterAddress) {
			return;
		}
		const substrateAddress = getSubstrateAddress(address);

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					return;
				}
				data.created_at && setProfileCreatedAt(new Date(data.created_at));
				setUsername(data.username);
				setImgUrl(data.profile?.image || '');
				setSocials(data?.profile.social_links || []);
				if (MANUAL_USERNAME_25_CHAR.includes(data.username) || data.custom_username || data.username.length !== 25) {
					setIsAutoGeneratedUsername(false);
					return;
				} else if (
					(data.web3Signup && !data.created_at && data.username.length === 25) ||
					(data.web3Signup && data.username.length === 25 && dayjs(data.created_at).isBefore(dayjs(FEATURE_RELEASE_DATE)))
				) {
					setIsAutoGeneratedUsername(true);
				}
			} catch (error) {
				// console.log(error);
			}
		}
	};
	const handleRedirectLink = () => {
		const substrateAddress = getSubstrateAddress(address);
		if (!username) {
			return `https://${network}.polkassembly.io/address/${substrateAddress}`;
		}
		return `https://${network}.polkassembly.io/user/${username}`;
	};

	const handleIdentityInfo = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.info(encodedAddr, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
				if (info.identity.displayParent && info.identity.display) {
					// when an identity is a sub identity `displayParent` is set
					// and `display` get the sub identity
					setMainDisplay(info.identity.displayParent);
					setSub(info.identity.display);
				} else {
					// There should not be a `displayParent` without a `display`
					// but we can't be too sure.
					setMainDisplay(
						info.identity.displayParent || info.identity.display || (!isAutoGeneratedUsername ? shortenUsername(username, usernameMaxLength) : null) || info.nickname || ''
					);
				}
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => {
				console.error(e);
				setMainDisplay('');
				setSub('');
			});

		return () => unsubscribe && unsubscribe();
	};

	const getKiltName = async () => {
		if (!api || !apiReady) return;

		const web3Name = await getKiltDidName(api, address);
		setKiltName(web3Name ? `w3n:${web3Name}` : '');
	};

	const handleFlags = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.flags(encodedAddr, (result: DeriveAccountFlags) => {
				setFlags(result);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	};

	useEffect(() => {
		if (!api || !apiReady || !address || !encodedAddr) return;

		try {
			fetchUsername(address);
		} catch (error) {
			console.log(error);
		}
		handleIdentityInfo();
		handleFlags();
		if (network === AllNetworks.KILT) {
			setKiltName('');
			getKiltName();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, address, encodedAddr, network]);

	const addressPrefix =
		kiltName ||
		mainDisplay ||
		(!isAutoGeneratedUsername ? username : null) ||
		(!showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr) ||
		shortenUsername(username, usernameMaxLength);
	const addressSuffix = extensionName || mainDisplay;

	const handleClick = (event: any) => {
		if (disableAddressClick) return;
		event.stopPropagation();
		event.preventDefault();
		window.open(handleRedirectLink(), '_blank');
	};
	return (
		<>
			<Tooltip
				arrow
				color='#fff'
				overlayClassName={className}
				destroyTooltipOnHide={destroyTooltipOnHide}
				title={
					<QuickView
						socials={socials}
						setOpen={setOpen}
						setOpenTipping={setOpenTipping}
						profileCreatedAt={profileCreatedAt}
						address={address}
						identity={identity}
						username={addressPrefix}
						polkassemblyUsername={username}
						imgUrl={imgUrl}
						setOpenAddressChangeModal={setOpenAddressChangeModal}
						isKiltNameExists={!!kiltName}
					/>
				}
				open={!disableTooltip ? open : false}
				onOpenChange={(e) => {
					setOpen(e);
				}}
			>
				<div className={`${className} flex gap-1`}>
					{!disableIdenticon &&
						(encodedAddr.startsWith('0x') ? (
							<EthIdenticon
								className='image identicon flex items-center'
								size={ethIdenticonSize || iconSize || 26}
								address={encodedAddr}
							/>
						) : (
							<Identicon
								className='image identicon'
								value={encodedAddr}
								size={iconSize && iconSize >= 20 ? iconSize : displayInline ? 20 : 32}
								theme={'polkadot'}
							/>
						))}
					{!isProfileView ? (
						<div className='flex items-center text-bodyBlue dark:text-blue-dark-high'>
							{displayInline ? (
								<div className='inline-address flex items-center'>
									{!!kiltName ||
										(!!identity && !!mainDisplay && (
											<IdentityBadge
												theme={theme}
												identity={identity}
												flags={flags}
												className='text-navBlue'
											/>
										))}

									<div className={`flex items-center font-semibold text-bodyBlue  dark:text-blue-dark-high  ${!disableAddressClick && 'cursor-pointer hover:underline'}`}>
										<div
											onClick={(e) => handleClick(e)}
											title={mainDisplay || encodedAddr}
											className={`flex gap-x-1 ${
												usernameClassName ? usernameClassName : 'font-semibold text-bodyBlue dark:text-blue-dark-high'
											} hover:text-bodyBlue dark:text-blue-dark-high ${inPostHeading ? 'text-xs' : 'text-sm'}`}
										>
											{!!addressPrefix && (
												<span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>
													{usernameMaxLength ? (addressPrefix.length > usernameMaxLength ? `${addressPrefix.slice(0, usernameMaxLength)}...` : addressPrefix) : addressPrefix}
												</span>
											)}
											{!!sub && !!isSubVisible && <span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>{sub}</span>}
										</div>
									</div>
								</div>
							) : !!extensionName || !!mainDisplay ? (
								<div className='ml-0.5 font-semibold text-bodyBlue'>
									{!disableHeader && (
										<div>
											<div className='flex items-center'>
												{!!kiltName ||
													(!!identity && !!mainDisplay && (
														<IdentityBadge
															identity={identity}
															flags={flags}
														/>
													))}
												<Space className={'header'}>
													<div
														onClick={(e) => handleClick(e)}
														className={`flex flex-col font-semibold text-bodyBlue  ${
															!disableAddressClick && 'cursor-pointer hover:underline'
														} hover:text-bodyBlue dark:text-blue-dark-high`}
													>
														{!!addressSuffix && <span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{addressSuffix}</span>}
														{!extensionName && !!sub && isSubVisible && (
															<span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{sub}</span>
														)}
													</div>
												</Space>
											</div>
										</div>
									)}
									<div
										className={`${!addressClassName ? 'text-xs' : addressClassName} ${
											!disableAddressClick && 'cursor-pointer hover:underline'
										} font-normal dark:text-blue-dark-medium`}
										onClick={(e) => handleClick(e)}
									>
										{kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
									</div>
								</div>
							) : (
								<div className={`${addressClassName} flex gap-0.5 text-xs font-semibold dark:text-blue-dark-medium`}>
									{kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
									{showKiltAddress && !!kiltName && <div className='font-normal text-lightBlue dark:text-blue-dark-medium'>({shortenAddress(encodedAddr, addressMaxLength)})</div>}
								</div>
							)}
						</div>
					) : (
						<div className={`flex items-center gap-x-2 font-semibold text-bodyBlue ${!addressSuffix && 'gap-0'}`}>
							{!disableHeader && (
								<div className='flex'>
									<div className='flex items-center'>
										<Space className={'header'}>
											<div
												onClick={(e) => handleClick(e)}
												className={`flex font-semibold text-bodyBlue  ${
													!disableAddressClick && 'cursor-pointer hover:underline'
												} text-base hover:text-bodyBlue dark:text-blue-dark-high`}
											>
												{!!addressSuffix && <span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{addressSuffix}</span>}
											</div>
										</Space>
									</div>
								</div>
							)}
							<div
								className={`${!addressClassName ? 'text-sm' : addressClassName} ${
									!disableAddressClick && 'cursor-pointer hover:underline'
								} font-normal dark:text-blue-dark-medium ${!addressSuffix && 'font-semibold'}`}
								onClick={(e) => handleClick(e)}
							>
								({kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr})
							</div>
							<div>{!!kiltName || (!!identity && !!mainDisplay && <VerifiedIcon className='scale-125' />)}</div>
						</div>
					)}

					{addressOtherTextType ? (
						<p className={'m-0 ml-auto flex items-center gap-x-1 text-[10px] leading-[15px] text-lightBlue dark:text-blue-dark-medium'}>
							<span
								className={classNames('h-[6px] w-[6px] rounded-full', {
									'bg-aye_green ': [EAddressOtherTextType.LINKED_ADDRESS, EAddressOtherTextType.COUNCIL_CONNECTED].includes(addressOtherTextType),
									'bg-blue ': addressOtherTextType === EAddressOtherTextType.COUNCIL,
									'bg-nay_red': [EAddressOtherTextType.UNLINKED_ADDRESS].includes(addressOtherTextType)
								})}
							></span>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>{addressOtherTextType}</span>
						</p>
					) : null}
				</div>
			</Tooltip>
			{!TippingUnavailableNetworks.includes(network) && (
				<Tipping
					username={addressPrefix}
					open={openTipping}
					setOpen={setOpenTipping}
					paUsername={username}
					key={address}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
				/>
			)}
		</>
	);
};

export default styled(Address)`
	.ant-tooltip-content .ant-tooltip-inner {
		width: 363px !important;
	}
`;
