// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckOutlined } from '@ant-design/icons';
import { Button, Form, Tooltip } from 'antd';
import { IAddPostCommentResponse } from 'pages/api/v1/auth/actions/addPostComment';
import React, { FC, useEffect, useState } from 'react';
import ErrorAlert from 'src/ui-components/ErrorAlert';
import UserAvatar from 'src/ui-components/UserAvatar';
import styled from 'styled-components';
import { ChangeResponseType } from '~src/auth/types';
import { usePostDataContext, useUserDetailsContext } from '~src/context';
import CommentSentimentModal from '~src/ui-components/CommentSentimentModal';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import ContentForm from '../ContentForm';
import queueNotification from '~src/ui-components/QueueNotification';
import { EVoteDecisionType, NotificationStatus } from '~src/types';
import { Input } from 'antd';
import { IComment } from './Comment/Comment';
import { getSubsquidLikeProposalType } from '~src/global/proposalType';
import SadDizzyIcon from '~assets/overall-sentiment/pink-against.svg';
import SadIcon from '~assets/overall-sentiment/pink-slightly-against.svg';
import NeutralIcon from '~assets/overall-sentiment/pink-neutral.svg';
import SmileIcon from '~assets/overall-sentiment/pink-slightly-for.svg';
import SmileDizzyIcon from '~assets/overall-sentiment/pink-for.svg';
import { ESentiment } from '~src/types';

interface IPostCommentFormProps {
	className?: string;
	isUsedInSuccessModal?: boolean;
	voteDecision? :EVoteDecisionType;
	setSuccessModalOpen?: (pre: boolean) => void;
	setCurrentState?:(postId: string, type:string, comment: IComment) => void;
}

interface IEmojiOption {
	icon: any;
	currentSentiment: number;
	clickable?:boolean;
	disabled?:boolean;
	className?: string;
	emojiButton?: boolean;
	title?:string;
}

const commentKey = () => `comment:${global.window.location.href}`;

const PostCommentForm: FC<IPostCommentFormProps> = (props) => {
	const { className , isUsedInSuccessModal = false ,  voteDecision = null,setCurrentState } = props;
	const { id, username, picture } = useUserDetailsContext();
	const { postData: { postIndex, postType, track_number } } = usePostDataContext();
	const [content, setContent] = useState(global.window.localStorage.getItem(commentKey()) || '');
	const [form] = Form.useForm();
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [openModal,setModalOpen]=useState(false);
	const [isComment,setIsComment]=useState(false);
	const [sentiment,setSentiment]=useState<number>(3);
	const [isSentimentPost,setIsSentimentPost]=useState(false);
	const [textBoxHeight,setTextBoxHeight] = useState(40);
	const [showEmojiMenu, setShowEmojiMenu] = useState(false);
	const [selectedIcon, setSelectedIcon] = useState(null);
	const [isPosted, setIsPosted] = useState(false);
	const [formContent, setFormContent] = useState('');

	useEffect(() => {
		switch (voteDecision) {
		case EVoteDecisionType.AYE:
			setSentiment(5);
			setIsSentimentPost(true);
			break;
		case EVoteDecisionType.NAY:
			setSentiment(1);
			setIsSentimentPost(true);
			break;
		default:
			setSentiment(3);
			setIsSentimentPost(true);
			break;
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleEmojiClick = (icon:any, currentSentiment:any) => {
		setContent((prevContent) => prevContent + icon);
		setSelectedIcon(icon);
		setShowEmojiMenu(!showEmojiMenu);
		setSentiment(currentSentiment);
		setIsSentimentPost(true);
	};

	const EmojiOption = ({ icon, currentSentiment = 3, clickable = true, disabled, emojiButton, title }: IEmojiOption) => {
		if (emojiButton) {
			return (
				<Button
					disabled={disabled}
					className={`${disabled && 'opacity-50'} text-2xl h-10 p-0 pt-1 mb-[4px] border-solid emoji-button w-10 hover:bg-baby_pink`}
					onClick={() => { clickable && handleEmojiClick(icon, currentSentiment); }}
				>
					{icon}
				</Button>
			);
		}
		return (
			<Tooltip color="#363636" title={title}>
				<Button
					disabled={disabled}
					className={`${disabled && 'opacity-50'} text-2xl w-10 h-10 p-0 pt-1 mb-[4px] border-none rounded-full emoji-button hover:bg-baby_pink`}
					onClick={() => { clickable && handleEmojiClick(icon, currentSentiment); }}
				>
					{icon}
				</Button>
			</Tooltip>
		);
	};

	const sentimentsIcons:any = {
		[ESentiment.Against]:  <SadDizzyIcon style={{ border: 'none' }} />,
		[ESentiment.SlightlyAgainst]:  <SadIcon style={{ border: 'none' }}/>,
		[ESentiment.Neutral]:  <NeutralIcon style={{ border: 'none' }}/>,
		[ESentiment.SlightlyFor]:  <SmileIcon style={{ border: 'none' }}/>,
		[ESentiment.For]:  <SmileDizzyIcon style={{ border: 'none' }}/>
	};

	const onContentChange = (content: string) => {
		setContent(content);
		global.window.localStorage.setItem(commentKey(), content);
		return content.length ? content : null;
	};

	const createSubscription = async (postId: number | string) => {
		const { data , error } = await nextApiClientFetch<ChangeResponseType>( 'api/v1/auth/actions/postSubscribe', { post_id: postId, proposalType: postType });
		if(error) console.error('Error subscribing to post', error);
		if(data) console.log(data.message);
	};

	const handleModalOpen=async() => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		if(!content) return;

		// To directly post the comment without openning the slider modal
		if(isUsedInSuccessModal){
			setIsSentimentPost(true);
			handleSave();
			return;
		}
		setModalOpen(true);
	};

	const handleSave = async () => {
		await form.validateFields();
		const content = form.getFieldValue('content');
		setFormContent(content);
		if(!content) return;

		setLoading(true);

		const { data , error } = await nextApiClientFetch<IAddPostCommentResponse>( 'api/v1/auth/actions/addPostComment', {
			content,
			postId: postIndex,
			postType: postType,
			sentiment:isSentimentPost?sentiment:0,
			trackNumber: track_number,
			userId: id
		});

		if(error || !data) {
			setError(error || 'No data returned from the saving comment query');
			queueNotification({
				header: 'Failed!',
				message: error,
				status: NotificationStatus.ERROR
			});
		}
		if(data) {
			setContent('');
			setIsPosted(true);
			form.resetFields();
			form.setFieldValue('content', '');
			global.window.localStorage.removeItem(commentKey());
			postIndex && createSubscription(postIndex);
			queueNotification({
				header: 'Success!',
				message: 'Comment created successfully.',
				status: NotificationStatus.SUCCESS
			});
			const comment=  {
				comment_reactions: {
					'👍': {
						count: 0,
						usernames: []
					},
					'👎': {
						count: 0,
						usernames: []
					}
				},
				content,
				created_at: new Date(),
				history: [],
				id: data?.id || '',
				profile: picture || '',
				replies: [],
				sentiment:isSentimentPost? sentiment : 0,
				updated_at: new Date(),
				user_id: id as any,
				username: username || '',
				vote:voteDecision
			};
			setCurrentState && setCurrentState(postIndex.toString(), getSubsquidLikeProposalType(postType as any), comment);
		}
		setLoading(false);
		setIsComment(false);
		setIsSentimentPost(false);
	};

	function adjustHeightByString(inputString:any) {
		const increment = 50;
		const heightIncrement = 15;

		let currentHeight = 40;

		const updateHeight = () => {
			currentHeight += heightIncrement;
			setTextBoxHeight(currentHeight);
		};

		if (inputString.length > increment) {
			const stringLengthMultiple = Math.floor(inputString.length / increment);
			currentHeight = 40 + stringLengthMultiple * heightIncrement;
		}

		if (inputString.length % increment === 0) {
			updateHeight();
		}
		return currentHeight;
	}
	useEffect(() => {
		isComment && handleSave();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	},[isComment]);

	if (!id) return <div>You must log in to comment.</div>;

	return (
		<div className={className}>
			<UserAvatar
				className='mt-4 hidden md:inline-block'
				username={username || ''}
				size={'large'}
				id={id}
			/>
			{isPosted ? (
				<div className="comment-message">
					<div className="mt-6 w-[500px] text-center h-30 overflow-hidden">
						<p className="truncate text-lightBlue">
							&apos;{formContent}&apos;
						</p>
					</div>
					<div className="text-green-600 mb-5 ml-[140px] -mt-[15px]">Comment posted successfully.</div>
				</div>
			) : (
				<div className={isUsedInSuccessModal ? 'p-[1rem] w-[95%]' : 'comment-box bg-white p-[1rem]'}>
					{error && <ErrorAlert errorMsg={error} className='mb-2' />}
					<Form
						form={form}
						name="comment-content-form"
						layout="vertical"
						onFinish={handleModalOpen}
						initialValues={{
							content
						}}
						disabled={loading}

						validateMessages= {
							{ required: "Please add the  '${name}'" }
						}
					>
						<div className={isUsedInSuccessModal ? 'flex justify-between items-center w-[522px] -ml-[30px]' : ''}>
							{
								isUsedInSuccessModal && <Form.Item name='content' className='w-full'>
									<Input
										name='content'
										className={`w-full h-[${textBoxHeight}px] border-[1px] rounded-[4px] text-sm mt-0 suffixColor hover:border-pink_primary flex-1 input-container`}
										onChange = {(e) => {onContentChange(e.target.value);adjustHeightByString(e.target.value);}}
										placeholder={'Type your comment here'}
										// style={{ border: '1px solid #D2D8E0', padding: '4px 8px' }}
									/>
								</Form.Item>

							}
							{
								!isUsedInSuccessModal && <ContentForm  onChange = {(content : any) => onContentChange(content)} height={200}/>
							}
							<Form.Item>
								<div className={ isUsedInSuccessModal ?'ml-2' :'flex items-center justify-end mt-[-40px]'}>
									{
										isUsedInSuccessModal ?
											<div className='relative'>
												<div className="flex">
													{showEmojiMenu && (
														<div className="absolute top-[-55px] right-[77px] w-[234px] h-[50px] pt-[7px] p-2 flex space-x-1 pb-12 -mt-1" style={{ background: '#FFF', border: '0.5px solid #D2D8E0', borderRadius: '6px', boxShadow: '0px 2px 14px 0px rgba(0, 0, 0, 0.06)' }}>
															<EmojiOption icon={<SadDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }} />} currentSentiment={1} title={'Completely Against'} />
															<EmojiOption icon={<SadIcon style={{ border: 'none', transform: 'scale(1.2)' }}/>} currentSentiment={2} title={'Slightly Against'} />
															<EmojiOption icon={<NeutralIcon style={{ border: 'none', transform: 'scale(1.2)' }}/>} currentSentiment={3} title={'Neutral'} />
															<EmojiOption icon={<SmileIcon style={{ border: 'none', transform: 'scale(1.2)' }}/>} currentSentiment={4}  title={'Slightly For'}/>
															<EmojiOption icon={<SmileDizzyIcon style={{ border: 'none', transform: 'scale(1.2)' }}/>} currentSentiment={5}  title={'Completely For'}/>
														</div>
													)}
													{!selectedIcon && (
														<div className="w-10 h-10 mr-[7px]" onClick={() => setShowEmojiMenu(!showEmojiMenu) }>
															<EmojiOption disabled={!content} emojiButton={true} icon={sentimentsIcons[sentiment]} currentSentiment={3} title={'Select Sentiment'} clickable={false} />
														</div>
													)}
													{selectedIcon && (
														<Button className="w-10 h-10 mr-[7px] p-0 pt-1 border-solid" onClick={() => setShowEmojiMenu(!showEmojiMenu) }>
															{ selectedIcon }
														</Button>
													)}
													<Button disabled={!content} loading={loading} htmlType="submit" className={`bg-pink_primary text-white border-none h-[40px] w-[67px] hover:bg-pink_secondary flex items-center justify-center my-0 ${!content ? 'opacity-50' : ''}`}>Post</Button>
												</div>
											</div>
											:
											<Button disabled={!content} loading={loading} htmlType="submit" className={`bg-pink_primary text-white border-white hover:bg-pink_secondary flex items-center my-0 ${!content ? 'bg-gray-500 hover:bg-gray-500' : ''}`}>
												<CheckOutlined /> Comment
											</Button>
									}
								</div>
							</Form.Item>
						</div>
					</Form>
				</div>
			) }
			{openModal && <CommentSentimentModal
				setSentiment={setSentiment}
				openModal={openModal}
				setModalOpen={setModalOpen}
				setIsComment={setIsComment}
				setIsSentimentPost={setIsSentimentPost}
				sentiment={sentiment}
			/>}
		</div>
	);
};

export default styled(PostCommentForm)`
	display: flex;
	margin: 2rem 0;

	.comment-box {
		width: calc(100% - 60px);
		
		@media only screen and (max-width: 768px) {
			width: calc(100%);
			padding: 0.5rem;
		}
	}

	.button-container {
		width: 100%;
		display: flex;
		justify-content: flex-end;
	}

	.emoji-button: hover {
		background-color: #FBDBEC;
	}

	.ant-tooltip {
    	font-size:16px;
    }
    .ant-tooltip .ant-tooltip-placement-leftTop{
    	height:10px;
    	padding:0px;
    }
    .ant-tooltip .ant-tooltip-inner{
    	min-height:0;
    }
	.ant-tooltip-arrow{
    	display:none;
    }
    .ant-tooltip-inner {
        color: black;
  	    font-size:10px;
  	    padding:6px 8px;
    }
`;
