// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ClockCircleOutlined, DislikeOutlined, LikeOutlined } from '@ant-design/icons';
import { Divider, Modal, Tooltip } from 'antd';
import { poppins } from 'pages/_app';
import React, { FC, useContext, useState } from 'react';
import { UserDetailsContext } from 'src/context/UserDetailsContext';
import getRelativeCreatedAt from 'src/util/getRelativeCreatedAt';
import { WarningMessageIcon } from '~src/ui-components/CustomIcons';
import { CommentsIcon } from '~src/ui-components/CustomIcons';
import TagsIcon from '~assets/icons/tags-icon.svg';
import OnchainCreationLabel from '~src/ui-components/OnchainCreationLabel';
import { getFormattedLike } from '~src/util/getFormattedLike';
import TopicTag from '~src/ui-components/TopicTag';
import { useTheme } from 'next-themes';

export interface IDiscussionProps {
	created_at: Date
	address: string;
	commentsCount?: number
	title: string
	username: string
	topic: string
	postReactionCount: {
		'👍': number;
		'👎': number;
	};
	post_id: string;
	tags:string[] | [];
	spam_users_count?: number;
	className?:string;
}

const DiscussionCard: FC<IDiscussionProps> = (props) => {
	const { created_at, commentsCount, address, title, username, topic, postReactionCount, post_id, tags, spam_users_count , className } = props;
	const currentUser = useContext(UserDetailsContext);
	const ownPost = currentUser.username === username;
	const relativeCreatedAt = getRelativeCreatedAt(created_at);
	const [tagsModal, setTagsModal] = useState<boolean>(false);
	const { resolvedTheme:theme } = useTheme();

	return (
		<>
			<div className={`${ownPost && 'border-l-pink_primary border-l-4'} border-2 border-solid border-[#DCDFE350] hover:border-pink_primary hover:shadow-xl transition-all duration-200 p-3 md:p-4 min-h-[120px] sm:flex xs:hidden dark:border-[#1F2125] dark:border-[1px] ${className}`}>
				<span className='font-medium text-center flex-none sm:w-[120px] text-blue-light-high dark:text-blue-dark-high dark:font-normal sm:mt-2'>#{post_id}</span>
				<div className="sm:flex flex-col sm:justify-between flex-1 sm:mt-[6px]">
					<OnchainCreationLabel address={address} topic={topic} username={username} />
					<div className="hidden sm:mt-2 sm:mb-1 sm:flex sm:justify-between sm:items-start sm:flex-row">
						<div className='mt-3 lg:mt-1'>
							<h1 className='text-blue-light-high dark:text-blue-dark-high font-medium text-sm flex dark:font-normal'>
								{title}
								{
									spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
										<div className='hidden lg:flex items-center justify-center ml-5'>
											<Tooltip color="#E5007A" title="This post could be a spam.">
												<WarningMessageIcon className='text-xl text-[#FFA012]' />
											</Tooltip>
										</div>
										: null
								}
							</h1>
						</div>
					</div>
					<div className="font-medium text-blue-light-high dark:text-blue-dark-high text-xs sm:flex xs:hidden flex-col lg:flex-row items-start lg:items-center dark:font-normal">

						<div className='flex items-center gap-x-2'>
							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5'>
								<LikeOutlined className='text-lightBlue dark:text-blue-dark-medium' />
								<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👍'])}</span>
							</div>

							<div className='xs:hidden sm:flex items-center justify-center gap-x-1.5'>
								<DislikeOutlined className='text-lightBlue dark:text-blue-dark-medium' />
								<span className='text-lightBlue dark:text-blue-dark-medium'>{getFormattedLike(postReactionCount['👎'])}</span>
							</div>

							<div className='xs:hidden sm:flex items-center'>
								<CommentsIcon className='mr-1 text-lightBlue dark:text-blue-dark-medium' />
								<span className=' text-lightBlue dark:text-blue-dark-medium'>{commentsCount}</span>
							</div>
							<Divider type="vertical" className='border-l-1 border-lightBlue dark:border-blue-dark-medium' />

							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} style={{ fontSize: '10px' }} className='text-lightBlue dark:text-blue-dark-medium rounded-xl px-[14px] py-[4px] border-[#D2D8E0] dark:border-blue-dark-medium border-solid border-[1px] font-medium' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-blue-light-high dark:text-blue-dark-high' style={{ background:'#D2D8E050' , borderRadius:'20px', fontSize:'10px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
							{tags && tags.length>0 && <Divider type="vertical" className='max-sm:hidden border-l-1 border-lightBlue dark:border-blue-dark-medium' />}
							{relativeCreatedAt && <>
								<div className='hidden text-lightBlue dark:text-blue-dark-medium sm:flex items-center'>
									<ClockCircleOutlined className='mr-1 dark:border-blue-dark-medium' /> {relativeCreatedAt}
								</div>
							</>}
							{
								topic?
									<div className='flex items-center sm:-mt-1'>
										<Divider type="vertical" className='max-sm:hidden sm:mt-1 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
										<TopicTag theme={theme} className='sm:mt-0 sm:mx-2' topic={topic} />
									</div>
									: null
							}
						</div>
					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-black' : ''} ${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px]`}
				><div className='flex'>
						<div className='text-lg tracking-wide font-medium text-blue-light-high dark:text-blue-dark-high mb-2 dark:bg-black'>
							<TagsIcon className='mr-2' />
							Tags
						</div>
					</div>
					<div className='w-full h-[1px] bg-[#D2D8E0]' />
					<div className='flex gap-2 flex-wrap mt-4' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] px-[16px] py-[2px] font-normal text-[10px] text-lightBlue' >
							{tag}
						</div>))}
					</>}</div>
				</Modal>
			</div>

			<div className={`${ownPost && 'border-l-pink_primary border-l-4'} border-2 border-solid border-[#DCDFE350] hover:border-pink_primary hover:shadow-xl transition-all duration-200 xs:p-2 md:p-4 min-h-[150px] h-auto xs:flex sm:hidden ${className} dark:border-[#1F2125] dark:border-[1px]`}>
				<div className="sm:hidden xs:flex flex-col flex-1 xs:mt-1">
					{
						topic &&
							<div className='flex justify-start'>
								<TopicTag theme={theme} className='xs:my-0.5 xs:mx-2' topic={topic} />
							</div>
					}
					<div className='max-xs-hidden m-2.5 text-blue-light-high dark:text-blue-dark-high font-medium dark:font-normal text-sm'>
						#{post_id} {title}
						<div className='flex justify-between items-center'>
							{
								spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
									<div className='flex lg:hidden items-center justify-center'>
										<Tooltip color="#E5007A" title="This post could be a spam.">
											<WarningMessageIcon className='text-xl text-[#FFA012]' />
										</Tooltip>
									</div>
									: null
							}
						</div>
						{
							spam_users_count && typeof spam_users_count === 'number' && spam_users_count > 0?
								<div className='hidden lg:flex items-center justify-center'>
									<Tooltip color="#E5007A" title="This post could be a spam.">
										<WarningMessageIcon className='text-xl text-[#FFA012]' />
									</Tooltip>
								</div>
								: null
						}
					</div>
					<div className="xs:mt-1 xs:gap-0 sm:gap-2.5 xs:ml-2 sm:ml-0 font-medium text-blue-light-high dark:text-blue-dark-high text-xs sm:hidden xs:flex flex-col lg:flex-row items-start lg:items-center">

						<div className='sm:hidden xs:flex xs:justify-start'>
							<OnchainCreationLabel address={address} username={username} />
							<Divider type="vertical" className='max-lg:hidden xs:inline-block xs:mt-0.5 border-l-1 border-lightBlue dark:border-blue-dark-medium' />
							{relativeCreatedAt && <>
								<div className='xs:flex xs:text-lightBlue dark:text-blue-dark-medium xs:-mt-0.5 mt-0 lg:flex items-center text-sm'>
									<ClockCircleOutlined className='mr-1 mt-0 dark:border-blue-dark-medium' /> {relativeCreatedAt}
								</div>
							</>}
						</div>

						<div className='xs:flex justify-between items-center xs:mt-3.5 xs:gap-x-2'>
							{tags && tags.length>0 && <Divider type="vertical" className='max-lg:hidden border-l-1 border-[#90A0B7] dark:border-blue-dark-medium' />}
							{tags && tags.length>0 && <>{ tags?.slice(0,2).map((tag,index) =>
								(<div key={index} style={{ fontSize:'10px' }} className='text-lightBlue dark:text-blue-dark-medium rounded-xl px-[14px] py-[4px] border-[#D2D8E0] dark:border-blue-dark-medium border-solid border-[1px] font-medium' >
									{tag}
								</div>))}
							{tags.length>2 && <span className='text-blue-light-high dark:text-blue-dark-medium' style={{ background:'#D2D8E050' , borderRadius:'20px', fontSize:'10px', padding:'4px 8px' }} onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(true);}}>
                +{tags.length-2}
							</span>}
							</>}
						</div>
					</div>
				</div>
				<Modal
					open= {tagsModal}
					onCancel={(e) => { e.stopPropagation(); e.preventDefault(); setTagsModal(false);}}
					footer={false}
					className={`${theme === 'dark'? '[&>.ant-modal-content]:bg-black' : ''} ${poppins.variable} ${poppins.className} max-w-full shrink-0  max-sm:w-[100%] h-[120px]`}
				><div className='flex dark:bg-black'>
						<TagsIcon className='mr-2 mt-1.5' />
						<h2 className='text-lg tracking-wide font-semibold text-blue-light-high dark:text-blue-dark-high mb-2'>Tags</h2>
					</div>
					<div className='w-full h-[1px] bg-[#D2D8E0]' />
					<div className='flex gap-2 flex-wrap mt-4' >{tags && tags.length>0 && <>{ tags?.map((tag,index) =>
						(<div key={index} className='rounded-xl border-solid border-[1px] border-[#D2D8E0] px-[16px] py-[2px] font-normal text-[10px] text-lightBlue' >
							{tag}
						</div>))}
					</>}</div>
				</Modal>
			</div>
		</>
	);
};

export default DiscussionCard;