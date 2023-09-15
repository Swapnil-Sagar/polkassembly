// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { useApiContext, useNetworkContext, useUserDetailsContext } from '~src/context';
import { Divider } from 'antd';
import userProfileBalances from '~src/util/userProfieBalances';
import { chainProperties } from '~src/global/networkConstants';
import dynamic from 'next/dynamic';
import AccountSelectionForm from '~src/ui-components/AccountSelectionForm';
import { Wallet } from '~src/types';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { Injected, InjectedAccount, InjectedWindow } from '@polkadot/extension-inject/types';
import { APPNAME } from '~src/global/appName';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { formatBalance } from '@polkadot/util';
import Image from 'next/image';
import { formatedBalance } from '~src/util/formatedBalance';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import LockBalanceIcon from '~assets/icons/lock-balance.svg';
import RightTickIcon from '~assets/icons/right-tick.svg';
import BN from 'bn.js';

interface Props {
	className?: string;
	address: string;
}

const AddressConnectModal = dynamic(() => import('~src/ui-components/AddressConnectModal'), {
	ssr: false
});
const ZERO_BN = new BN(0);

const ProfileBalances = ({ className, address }: Props) => {
	const [balance, setBalance] = useState<BN>(ZERO_BN);
	const [lockBalance, setLockBalance] = useState<BN>(ZERO_BN);
	const [transferableBalance, setTransferableBalance] = useState<BN>(ZERO_BN);
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkContext();
	const unit = `${chainProperties[network]?.tokenSymbol}`;
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [accounts, setAccounts] = useState<InjectedAccount[]>([]);
	const { loginWallet, setUserDetailsContextState, delegationDashboardAddress } = useUserDetailsContext();
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [defaultAddress, setAddress] = useState<string>(delegationDashboardAddress);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady || !address) return;
		(async () => {
			const balances = await userProfileBalances({ address, api, apiReady, network });
			setBalance(balances?.freeBalance || ZERO_BN);
			setTransferableBalance(balances?.transferableBalance || ZERO_BN);
			setLockBalance(balances?.lockedBalance || ZERO_BN);
		})();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [address, api, apiReady]);

	const getAccounts = async (chosenWallet: Wallet): Promise<undefined> => {
		if (!api || !apiReady || !chosenWallet) return;

		const injectedWindow = window as Window & InjectedWindow;

		const wallet = isWeb3Injected ? injectedWindow.injectedWeb3[String(chosenWallet)] : null;

		if (!wallet) {
			return;
		}

		let injected: Injected | undefined;

		try {
			injected = await new Promise((resolve, reject) => {
				const timeoutId = setTimeout(() => {
					reject(new Error('Wallet Timeout'));
				}, 60000); // wait 60 sec
				if (wallet && wallet.enable) {
					wallet
						.enable(APPNAME)
						.then((value) => {
							clearTimeout(timeoutId);
							resolve(value);
						})
						.catch((error) => {
							reject(error);
						});
				}
			});
		} catch (err) {
			console.log(err?.message);
		}
		if (!injected) {
			return;
		}

		const accounts = await injected.accounts.get();

		if (accounts.length === 0) {
			return;
		}

		accounts.forEach((account) => {
			account.address = getEncodedAddress(account.address, network) || account.address;
		});

		setAccounts(accounts);
		if (accounts.length > 0) {
			if (api && apiReady) {
				api.setSigner(injected.signer);
			}

			if (loginWallet) {
				localStorage.setItem('delegationWallet', loginWallet);
				localStorage.setItem('delegationDashboardAddress', address || delegationDashboardAddress);
				setUserDetailsContextState((prev) => {
					return { ...prev, delegationDashboardAddress: address || delegationDashboardAddress };
				});
			}
			setAddress(address);
		}
		return;
	};

	useEffect(() => {
		loginWallet && getAccounts(loginWallet);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginWallet, delegationDashboardAddress, api, apiReady]);

	return (
		<div className={'flex w-full items-center justify-between pl-[40px] max-md:pl-4 '}>
			<div className={`${className} flex h-full items-center  gap-1 py-[17px] max-md:px-[10px]`}>
				<div className='flex h-[71px] flex-col justify-start gap-1 py-2 '>
					<div className='gap-1 text-2xl font-semibold tracking-[0.0015em] text-white'>
						{formatedBalance(balance.toString(), unit, 2)}
						<span className='ml-1 text-sm font-medium tracking-[0.015em] text-white'>{unit}</span>
					</div>
					<div className='ml-[1px] flex items-center justify-start gap-2'>
						<Image
							className='h-5 w-5 rounded-full object-contain'
							src={chainProperties[network]?.logo ? chainProperties[network].logo : chainLogo}
							alt='Logo'
						/>
						<span className='text-sm font-normal tracking-[0.01em] text-white'>Balance</span>
					</div>
				</div>
				<Divider
					type='vertical'
					style={{ borderLeft: '1px solid #D2D8E0', height: '100%' }}
				/>
				<div className='flex justify-start gap-4 py-2 max-md:gap-2'>
					<div className='flex h-[71px] flex-col gap-1 py-2'>
						<div className='gap-1 text-2xl font-semibold tracking-[0.0015em] text-white'>
							{formatedBalance(transferableBalance.toString(), unit, 2)}
							<span className='ml-1 text-sm font-medium tracking-[0.015em] text-white'>{unit}</span>
						</div>
						<div className='ml-1 flex items-center justify-start gap-2'>
							<RightTickIcon />
							<span className='text-sm font-normal tracking-[0.01em] text-white'>Transferable</span>
						</div>
					</div>
					<div className='flex h-[71px] flex-col justify-start gap-1 py-2'>
						<div className='gap-1 text-2xl font-semibold tracking-[0.0015em] text-white'>
							{formatedBalance(lockBalance.toString(), unit, 2)}
							<span className='ml-1 text-sm font-medium tracking-[0.015em] text-white'>{unit}</span>
						</div>
						<div className='ml-1 flex items-center justify-start gap-2'>
							<LockBalanceIcon />
							<span className='text-sm font-normal tracking-[0.01em] text-white'>Total Locked</span>
						</div>
					</div>
				</div>
			</div>
			<div className='-mt-6 mr-6 w-[275px]'>
				{accounts.length > 0 && (
					<AccountSelectionForm
						addressTextClassName='text-white'
						accounts={accounts}
						address={delegationDashboardAddress}
						withBalance={false}
						className='cursor-pointer text-sm text-[#788698]'
						onAccountChange={setAddress}
						inputClassName='text-[#fff] border-[1.5px] border-[#D2D8E0] bg-[#850c4d] text-sm border-solid px-3 rounded-[8px] py-[6px]'
						isSwitchButton={true}
						setSwitchModalOpen={setOpenModal}
						withoutInfo={true}
					/>
				)}
			</div>
			<AddressConnectModal
				localStorageWalletKeyName='delegationWallet'
				usingMultisig
				localStorageAddressKeyName='delegationDashboardAddress'
				open={openModal}
				setOpen={setOpenModal}
				closable={true}
				walletAlertTitle='Delegation dashboard'
			/>
		</div>
	);
};
export default ProfileBalances;
