// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { useEffect, useState } from 'react';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import Address from './Address';
import { poppins } from 'pages/_app';
import DownIcon from '~assets/icons/down-icon.svg';
import styled from 'styled-components';
import Balance from '~src/components/Balance';
import { Button, Modal } from 'antd';
import Web2Login from '~src/components/Login/Web2Login';
import { CloseIcon } from './CustomIcons';
import { WalletIcon } from '~src/components/Login/MetamaskLogin';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { Wallet } from '~src/types';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import NetworkIcon from '~assets/icons/USB.svg';

interface Props {
	proxyAddresses: string[];
	className?: string;
	theme?: string;
	withBalance?: boolean;
	address?: string;
	onBalanceChange?: (balance: string) => void;
	isBalanceUpdated?: boolean;
	inputClassName?: string;
	setShowWalletModal?: (pre: boolean) => void;
	showWalletModal?: boolean;
	wallet?: any;
	setIsProxyExistsOnWallet?: (pre: boolean) => void;
	setSelectedProxyAddress?: (pre: string) => void;
	selectedProxyAddress?: string;
}

const ProxyAccountSelectionForm = ({
	isBalanceUpdated,
	onBalanceChange,
	withBalance,
	address,
	proxyAddresses,
	className,
	theme,
	inputClassName,
	wallet,
	setSelectedProxyAddress,
	selectedProxyAddress,
	setIsProxyExistsOnWallet
}: Props) => {
	const [showWalletModal, setShowWalletModal] = useState(false);
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const [changedWallet, setChangedWallet] = useState(wallet);
	const [walletType, setWalletType] = useState<any>();
	const { loginAddress } = useUserDetailsSelector();

	const dropdownMenuItems: ItemType[] = proxyAddresses.map((proxyAddress) => {
		return {
			key: proxyAddress,
			label: (
				<Address
					className={`flex items-center ${poppins.className} ${poppins.className}`}
					addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
					address={proxyAddress}
					disableAddressClick
					disableTooltip
				/>
			)
		};
	});

	const getAllAccounts = async () => {
		if (!api || !apiReady || !wallet) return;
		if (changedWallet === 'subwallet-js') {
			setWalletType(Wallet.SUBWALLET);
		} else if (changedWallet === 'polkadot-js') {
			setWalletType(Wallet.POLKADOT);
		} else if (changedWallet === 'talisman') {
			setWalletType(Wallet.TALISMAN);
		} else if (changedWallet === 'polkagate') {
			setWalletType(Wallet.POLKAGATE);
		} else if (changedWallet === 'polywallet') {
			setWalletType(Wallet.POLYWALLET);
		} else if (changedWallet === 'polkasafe') {
			setWalletType(Wallet.POLKASAFE);
		}

		const addressData = await getAccountsFromWallet({ api, apiReady, chosenWallet: changedWallet || wallet, loginAddress, network });
		if (addressData?.accounts?.length && selectedProxyAddress) {
			const exists = addressData?.accounts.filter((account) => getSubstrateAddress(account.address) === getSubstrateAddress(selectedProxyAddress))?.length;
			setIsProxyExistsOnWallet?.(!!exists);
		}
	};

	useEffect(() => {
		getAllAccounts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProxyAddress, changedWallet]);

	return (
		<>
			<article className='mt-2 flex w-full flex-col'>
				<div className='mb-1 ml-[-6px] flex items-center gap-x-2'>
					<h3 className='inner-headings mb-[1px] ml-1.5 dark:text-blue-dark-medium'>Vote with Proxy</h3>
					{address && withBalance && (
						<Balance
							address={selectedProxyAddress || ''}
							onChange={onBalanceChange}
							isBalanceUpdated={isBalanceUpdated}
						/>
					)}
				</div>
				<Dropdown
					trigger={['click']}
					overlayClassName='z-[2000]'
					className={`${className} ${inputClassName} h-[48px] rounded-md border-[1px] border-solid border-gray-300 px-3 py-1 text-xs dark:border-[#3B444F] dark:border-separatorDark`}
					menu={{
						items: dropdownMenuItems,
						onClick: (e: any) => {
							if (e.key !== '1') {
								setSelectedProxyAddress?.(e.key);
							}
						}
					}}
					theme={theme}
				>
					<div className='flex items-center justify-between '>
						<Address
							address={selectedProxyAddress || proxyAddresses[0]}
							className='flex flex-1 items-center'
							addressClassName='text-lightBlue text-xs dark:text-blue-dark-medium'
							disableAddressClick
							disableTooltip
						/>
						<div
							className='mr-[100px] flex h-[18px] items-center justify-center gap-x-1 rounded-[10px] px-3'
							style={{ background: 'rgba(64, 123, 255, 0.06)' }}
						>
							<NetworkIcon />
							<p className='m-0 p-0 text-[10px] text-lightBlue'>Proxy Address</p>
						</div>
						<Button
							className='flex h-[25px] items-center border border-[#D2D8E0] bg-[#F9FAFB] p-0 px-2 text-xs text-bodyBlue hover:border-[#D2D8E0] hover:bg-[#EFF0F1] dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-medium hover:dark:bg-transparent'
							onClick={(e) => {
								e.preventDefault;
								e.stopPropagation();
								setShowWalletModal?.(!showWalletModal);
							}}
						>
							<WalletIcon
								which={walletType}
								isProxyAccountForm={true}
								className='walletIcon-container mr-[2px]'
							/>
							Change Wallet
						</Button>
						<span className='mx-2 mb-1'>
							<DownIcon />
						</span>
					</div>
				</Dropdown>
			</article>

			<Modal
				open={showWalletModal}
				footer={false}
				className={`${className} ${poppins.variable} ${poppins.className} alignment-close -mt-2 border dark:border-separatorDark dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
				wrapClassName={`custom-modal-backdrop ${className} dark:bg-modalOverlayDark`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				onCancel={() => {
					setShowWalletModal?.(false);
				}}
			>
				<Web2Login
					theme={theme}
					isModal={true}
					onWalletSelect={(e) => {
						setChangedWallet(e);
						getAllAccounts();
					}}
					showWeb2Option={false}
					setShowWalletModal={setShowWalletModal}
				/>
			</Modal>
		</>
	);
};

export default styled(ProxyAccountSelectionForm)`
	.ant-dropdown-trigger {
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
	}
	.ant-modal-content {
		border: ${(props) => (props.theme == 'dark' ? '1px solid #4B4B4B' : '1px solid #d2d8e0')} !important;
		padding: 0 !important;
		padding-bottom: 8px !important;
	}
	.custom-modal-backdrop {
		background-color: rgba(0, 0, 0, 0.2);
	}
`;
