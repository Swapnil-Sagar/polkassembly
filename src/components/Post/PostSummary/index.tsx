// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import React, { FC, useState } from 'react';
import classNames from 'classnames';
import Markdown from '~src/ui-components/Markdown';
import styled from 'styled-components';
import { AiStarIcon, OpenAiIcon, SummaryModalClose } from '~src/ui-components/CustomIcons';
import { usePostDataContext } from '~src/context';

interface IPostSummaryProps {
    className?: string;
}

const sanitizeSummary = (md: string) => {
	let newMd = (md || '').trim();
	if (newMd.startsWith('-')) {
		newMd = newMd.substring(1);
	} else if (newMd.startsWith(':')) {
		newMd = newMd.substring(1);
	}
	return newMd;
};

const PostSummary: FC<IPostSummaryProps> = (props) => {
	const { className } = props;
	const { postData: { summary } } = usePostDataContext();
	const [open, setOpen] = useState(false);
	return (
		<section className={classNames(className, 'flex justify-center items-center')}>
			<Divider className='hidden md:block border-l-1 border-lightBlue dark:border-blue-dark-medium' type="vertical" />
			<button
				onClick={() => setOpen(true)}
				className='flex items-center gap-x-1 justify-center cursor-pointer text-lightBlue bg-white dark:bg-section-dark-overlay text-xs leading-[18px] p-[1.5px] font-medium outline-none ai-btn-border'
			>
				<p className='bg-white dark:bg-section-dark-overlay m-0 flex items-center justify-center px-2 py-1 rounded-[5px]'>
					<span className='flex items-center justify-center text-lightBlue text-lg'>
						<AiStarIcon />
					</span>
					<span className='text-xs font-medium leading-[18px] tracking-[0.048px]'>
						AI Summary
					</span>
				</p>
			</button>
			<Modal
				className={classNames(className, 'pl-0 pb-0 ml-0 ml-4 md:ml-auto h-[calc(100vh-250px)] md:min-w-[604px]')}
				open={open}
				onCancel={() => setOpen(false)}
				closable={false}
				title={<div className='p-5 pb-4 md:p-6 md:pb-4 m-0 flex items-start md:items-center justify-between rounded-[14px]'>
					<article className='flex flex-col md:items-center gap-x-[6px] md:flex-row'>
						<h3 className='m-0 p-0 flex items-center gap-x-2'>
							<span className='flex items-center justify-center text-lightBlue text-2xl'>
								<AiStarIcon />
							</span>
							<span className='text-blue-light-high dark:text-blue-dark-high text-lg md:text-xl font-semibold leading-7 md:leading-6 tracking-[0.03px]'>
								AI Summary
							</span>
						</h3>
						<div className='flex items-center gap-x-1 rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.20)] pl-[6px] pr-[8px] py-1 md:pl-[10px] md:py-[6px] md:pr-3'>
							<OpenAiIcon className='text-base md:text-2xl' />
							<p className='m-0 text-blue-light-high dark:text-blue-dark-high text-[10px] md:text-xs leading-normal tracking-[0.24px] font-semibold'>
								Powered by OpenAI
							</p>
						</div>
					</article>
					<button onClick={() => setOpen(false)} className='cursor-pointer border-none outline-none bg-transparent flex items-center justify-center mt-2 md:mt-0'>
						<SummaryModalClose className='text-sm text-lightBlue' />
					</button>
				</div>}
				footer={null}
			>
				<Divider className='m-0 p-0 bg-[#e1e6eb]' />
				<div className='p-4 px-5 md:p-6'>
					<Markdown className='md text-blue-light-high dark:text-blue-dark-high font-normal text-sm leading-[26px] tracking-[0.14px]' md={sanitizeSummary(summary || '')} />
				</div>
			</Modal>
		</section>
	);
};

export default styled(PostSummary)`
	.ant-modal-content {
		border-radius: 14px !important;
		padding: 0 !important;
		margin: auto !important;
	}
	.ant-modal-header {
		border-radius: 14px !important;
		margin: 0 !important;
	}
	.md > p {
		margin: 0 !important;
	}
	.ai-btn-border {
		background-image: linear-gradient(95.24deg, #CF2DAB -3.77%, #40E8FF 11.75%, rgba(106, 65, 221, 0.72) 65.2%, #B62E76 89.54%, rgba(0, 0, 0, 0) 102.72%) !important;
		background-origin: border-box !important;
    	background-clip: padding-box, border-box !important;
		border-radius: 8px !important;
		border: 1px solid transparent !important;
	}
`;