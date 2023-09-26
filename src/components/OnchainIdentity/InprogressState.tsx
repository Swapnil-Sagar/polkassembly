// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect } from 'react';
import { ESetIdentitySteps, ISocials } from '.';
import { poppins } from 'pages/_app';
import { Button, Modal } from 'antd';
import CloseIcon from '~assets/icons/close-icon.svg';
import SuccessIcon from '~assets/icons/identity-success.svg';
import { NetworkContext } from '~src/context/NetworkContext';
import { chainProperties } from '~src/global/networkConstants';
import { formatBalance } from '@polkadot/util';
import { ESocials } from '~src/types';

interface Props {
	className?: string;
	socials: ISocials;
	open?: boolean;
	changeStep: (step: ESetIdentitySteps) => void;
	close: (pre: boolean) => void;
	openPreModal: (pre: boolean) => void;
	handleVerify: (pre: ESocials) => Promise<void>;
}

const InprogressState = ({ className, open, close, changeStep, openPreModal, socials, handleVerify }: Props) => {
	const { email } = socials;

	const { network } = useContext(NetworkContext);

	useEffect(() => {
		if (!network) return;
		formatBalance.setDefaults({
			decimals: chainProperties[network].tokenDecimals,
			unit: chainProperties[network].tokenSymbol
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);

	const handleVerified = async () => {
		await handleVerify(ESocials.EMAIL);
	};

	return (
		<Modal
			centered
			open={open}
			className={`${poppins.variable} ${poppins.className} w-[650px] max-sm:w-full`}
			wrapClassName={className}
			closeIcon={<CloseIcon />}
			onCancel={() => {
				close(true);
				changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
				openPreModal(false);
			}}
			footer={false}
			maskClosable={false}
		>
			<>
				<div className='-mt-[132px] flex flex-col items-center justify-center'>
					<SuccessIcon />
					<label className='mt-4 text-xl font-semibold tracking-[0.0015em] text-bodyBlue'>Email verification in progress</label>
					<div className='mt-4 text-2xl font-semibold text-pink_primary'>Check your email!</div>
					<div className=' mt-4 flex w-full shrink-0 flex-col items-center justify-center text-center text-sm tracking-wide '>
						<span className='flex shrink-0'>A verification link has been sent to your mail address</span>
						<u className='font-medium text-pink_primary'>
							<a
								target='_blank'
								href='https://mail.google.com/'
								rel='noreferrer'
							>
								{email?.value}
							</a>
						</u>
					</div>
				</div>

				<Button
					onClick={() => {
						close(true);
						handleVerified();
						changeStep(ESetIdentitySteps.SOCIAL_VERIFICATION);
						openPreModal(true);
					}}
					className='mt-4 h-[40px] w-full rounded-[4px] border-none bg-pink_primary text-sm tracking-wide text-white'
				>
					Verified successfully
				</Button>
			</>
		</Modal>
	);
};

export default InprogressState;
