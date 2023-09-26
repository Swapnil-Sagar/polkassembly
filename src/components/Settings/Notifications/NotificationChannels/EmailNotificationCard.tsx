// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import MailFilled from '~assets/icons/email-notification.svg';
import { Switch } from 'antd';
import DisabledConfirmation from './Modals/Confirmation';
import { CHANNEL } from '.';
type Props = {
	verifiedEmail: string;
	handleEnableDisabled: any;
	verified: boolean;
	notificationEnabled: boolean;
};

export default function EmailNotificationCard({ verifiedEmail, handleEnableDisabled, verified, notificationEnabled }: Props) {
	const [showModal, setShowModal] = useState<boolean>(false);
	const handleToggleClick = () => {
		setShowModal(true);
	};

	return (
		<div className='mb-2 flex flex-col'>
			<h3 className='m-0 flex items-center gap-1 gap-2 text-base font-medium text-[#243A57]'>
				<span>
					<MailFilled /> Email Notifications{' '}
					{!verified && (
						<span className='rounded-bl-lg rounded-tr-lg border-2 border-[#5A46FF] bg-[red] px-[4px] py-[2px] text-[10px] text-[#FFFFFF]'>
							{' '}
							{verifiedEmail ? 'Not Verified' : 'Not Added'}
						</span>
					)}
				</span>
				{!!verifiedEmail && verified && (
					<span className='flex items-center gap-1'>
						<Switch
							checked={!!notificationEnabled}
							size='small'
							onChange={(checked) => (!checked ? handleToggleClick() : handleEnableDisabled(CHANNEL.EMAIL, true))}
						/>
						<label>
							<span className={`text-[14px] font-medium  ${notificationEnabled ? 'text-pink_primary' : 'text-[#485F7D]'}`}>{notificationEnabled ? 'Enabled' : 'Disabled'}</span>
						</label>
					</span>
				)}
			</h3>
			<div className='ml-5'>
				<h3 className='m-0 text-[14px] text-[#243A57]'>{verifiedEmail ? verifiedEmail : 'Please add your email on account page.'}</h3>
			</div>
			<DisabledConfirmation
				open={showModal}
				onConfirm={() => {
					setShowModal(false);
					handleEnableDisabled(CHANNEL.EMAIL);
				}}
				onCancel={() => setShowModal(false)}
				channel={CHANNEL.EMAIL}
			/>
		</div>
	);
}
