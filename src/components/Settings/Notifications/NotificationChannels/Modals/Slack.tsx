// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, message } from 'antd';
import React, { useState } from 'react';
import CopyIcon from '~assets/icons/content-copy-pink.svg';
import { CHANNEL } from '..';
import CustomButton from '~src/basic-components/buttons/CustomButton';

type Props = {
	icon: any;
	title: string;
	open: boolean;
	getVerifyToken: (channel: CHANNEL) => Promise<any>;
	generatedToken?: string;
	onClose: () => void;
};

const SlackInfoModal = ({ icon, title, open, getVerifyToken, generatedToken = '', onClose }: Props) => {
	const [loading, setLoading] = useState(false);
	const [token, setToken] = useState(generatedToken);

	const handleGenerateToken = async () => {
		setLoading(true);
		const data = await getVerifyToken(CHANNEL.SLACK);
		setToken(data);
		setLoading(false);
	};

	const handleCopyClicked = (text: string) => {
		navigator.clipboard.writeText(text);
		message.success('Copied');
	};

	return (
		<Modal
			className='dark:[&>.ant-modal-content]:bg-section-dark-overlay'
			wrapClassName='dark:bg-modalOverlayDark'
			title={
				<h3 className='mb-5 flex items-center gap-3'>
					{icon} {title}
				</h3>
			}
			open={open}
			closable
			onCancel={onClose}
			footer={null}
		>
			<div className=''>
				<ol>
					<li className='list-inside leading-[40px]'>
						Click this invite link <br />
						<span className='bg-bg-secondary border-text_secondary mx-2 rounded-md border border-solid p-1 text-pink_primary'>
							<a
								href='https://premiurly.slack.com/apps/A059VBVGL59-polkassembly-bot'
								target='_blank'
								rel='noreferrer'
							>
								https://premiurly.slack.com/apps/A059VBVGL59-polkassembly-bot
							</a>
						</span>
					</li>
					<li className='list-inside leading-[40px]'>
						Send this command to the chat with the bot:
						<br />
						<span
							onClick={() => handleCopyClicked('/polkassembly-add <username> <verificationToken>')}
							className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
						>
							/polkassembly-add {'<username>'} {'<verificationToken>'} <CopyIcon className='relative top-[6px]' />
						</span>
						<div className='mt-4 flex justify-end'>
							<CustomButton
								loading={loading}
								onClick={handleGenerateToken}
								variant='primary'
								text='Generate Token'
							/>
						</div>
						{token && (
							<>
								<br />
								<span>Verification Token: </span>
								<span
									onClick={() => handleCopyClicked(token)}
									className='bg-bg-secondary border-text_secondary mx-2 cursor-pointer rounded-md border border-solid p-1 text-pink_primary'
								>
									{token} <CopyIcon className='relative top-[6px]' />
								</span>
							</>
						)}
					</li>
				</ol>
			</div>
		</Modal>
	);
};

export default SlackInfoModal;
