// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Spin, Timeline, TimelineItemProps } from 'antd';
import styled from 'styled-components';
import { EmailIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { ESetIdentitySteps, ISocials } from '.';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import queueNotification from '~src/ui-components/QueueNotification';
import { ESocials, NotificationStatus, VerificationStatus } from '~src/types';
import { IVerificationResponse } from 'pages/api/v1/verification';
import BN from 'bn.js';
import { useEffect, useState } from 'react';
import InprogressState from './InprogressState';
import VerifiedTick from '~assets/icons/verified-tick.svg';

interface Props {
	className?: string;
	socials: ISocials;
	setSocials: (pre: ISocials) => void;
	address: string;
	startLoading: (pre: boolean) => void;
	onCancel: () => void;
	changeStep: (pre: ESetIdentitySteps) => void;
	closeModal: (pre: boolean) => void;
	setLoading: (pre: boolean) => void;
	perSocialBondFee: BN;
	identityHash: string;
	setOpenSuccessModal: (pre: boolean) => void;
}
interface ISocialLayout {
	title: string;
	description: string;
	value: string | null;
	onVerify: () => void;
	verified?: boolean;
	status?: VerificationStatus;
	loading: boolean;
	fieldName?: ESocials;
}
interface IJudgementResponse {
	message?: string;
	hash?: string;
}

const SocialsLayout = ({ title, description, value, onVerify, verified, status, loading, fieldName }: ISocialLayout) => {
	return (
		<Spin
			spinning={loading}
			className='-mt-4'
		>
			<div className='ml-2 flex h-[70px] gap-5 text-lightBlue'>
				<span className='w-[60px] py-1.5 text-sm'>{title}</span>
				<div className='w-full'>
					<div
						className={`flex h-[40px]  items-center justify-between rounded-[4px] border-[1px] border-solid border-[#D2D8E0] pl-3 pr-2 tracking-wide ${
							verified ? 'bg-[#f6f7f9] text-[#8d99a9]' : 'bg-white text-bodyBlue'
						}`}
					>
						<span>{value}</span>
						{verified ? (
							<span className='flex items-center justify-center gap-2 text-xs text-[#8d99a9]'>
								<VerifiedTick />
								Verified
							</span>
						) : (
							<Button
								onClick={onVerify}
								className={`h-[30px] rounded-[4px] border-none bg-pink_primary text-xs font-medium tracking-wide text-white ${
									[VerificationStatus.VERFICATION_EMAIL_SENT, VerificationStatus.PLEASE_VERIFY_TWITTER]?.includes(status as VerificationStatus) ? 'w-[120px]' : 'w-[68px]'
								}`}
							>
								{status === VerificationStatus.VERFICATION_EMAIL_SENT || (fieldName === ESocials.TWITTER && status === VerificationStatus.PLEASE_VERIFY_TWITTER)
									? 'Confirm'
									: 'Verify'}
							</Button>
						)}
					</div>
					{!verified && <span className='text-xs'>{description}</span>}
				</div>
			</div>
		</Spin>
	);
};

const SocialVerification = ({ className, socials, onCancel, setLoading, closeModal, changeStep, setSocials, address, identityHash, setOpenSuccessModal }: Props) => {
	const { email, twitter } = socials;
	const [open, setOpen] = useState<boolean>(false);
	const [status, setStatus] = useState({ email: '', twitter: '' });
	const [fieldLoading, setFieldLoading] = useState<{ twitter: boolean; email: boolean }>({ email: false, twitter: false });
	const [twitterVerificationStart, setTwitterVerificationStart] = useState<boolean>(false);

	const items: TimelineItemProps[] = [];

	const handleTwitterVerificationClick = async () => {
		if (twitterVerificationStart) {
			await handleVerify(ESocials.TWITTER, true);
		} else {
			setTwitterVerificationStart(true);
			await handleTwitterVerification();
		}
	};
	if (email?.value) {
		items.push({
			children: (
				<SocialsLayout
					title='Email'
					description='Check your primary inbox or spam to verify your email address.'
					onVerify={async () => await handleVerify(ESocials.EMAIL, status.email === VerificationStatus.VERFICATION_EMAIL_SENT ? true : false, true)}
					value={email?.value}
					verified={email?.verified}
					status={status?.email as VerificationStatus}
					loading={fieldLoading.email}
				/>
			),
			dot: <EmailIcon className={` ${email?.verified ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B]'} ' rounded-full p-2.5 text-xl`} />,
			key: 1
		});
	}
	if (twitter?.value) {
		items.push({
			children: (
				<SocialsLayout
					title='Twitter'
					description='Please login to Twitter to verify your email address.'
					onVerify={handleTwitterVerificationClick}
					value={twitter?.value}
					verified={twitter?.verified}
					status={twitterVerificationStart ? VerificationStatus.PLEASE_VERIFY_TWITTER : (status?.twitter as VerificationStatus)}
					loading={fieldLoading.twitter}
					fieldName={ESocials.TWITTER}
				/>
			),
			dot: <TwitterIcon className={` ${twitter?.verified ? 'bg-[#51D36E] text-white' : 'bg-[#edeff3] text-[#576D8B]'} ' rounded-full p-2.5 text-xl`} />,
			key: 2
		});
	}
	const handleLocalStorageSave = (field: any) => {
		let data: any = localStorage.getItem('identityForm');
		if (data) {
			data = JSON.parse(data);
		}
		localStorage.setItem(
			'identityForm',
			JSON.stringify({
				...data,
				...field
			})
		);
		setSocials({
			...socials,
			email: { ...email, ...data?.email },
			twitter: { ...twitter, ...data?.twitter }
		});
	};

	const handleSetStates = (fieldName: ESocials, verified: boolean, verificationStatus: VerificationStatus, noStatusUpdate?: boolean) => {
		if (ESocials.EMAIL === fieldName) {
			setSocials({ ...socials, email: { ...email, verified } });
			!noStatusUpdate && setStatus({ ...status, email: verificationStatus });
			handleLocalStorageSave({ email: { ...email, verified } });
		} else {
			setSocials({ ...socials, twitter: { ...twitter, verified } });
			!noStatusUpdate && setStatus({ ...status, twitter: verificationStatus });
			handleLocalStorageSave({ twitter: { ...twitter, verified } });
		}
	};

	const handleVerify = async (fieldName: ESocials, checkingVerified?: boolean, isNotificaiton?: boolean) => {
		const account = fieldName === ESocials.TWITTER ? socials?.[fieldName]?.value?.split('@')?.[1] || socials?.[fieldName]?.value : socials?.[fieldName]?.value;

		if (!checkingVerified) {
			setFieldLoading({ ...fieldLoading, [fieldName]: true });
		} else {
			setLoading(true);
		}

		const { data, error } = await nextApiClientFetch<IVerificationResponse>(
			`api/v1/verification?type=${fieldName}&checkingVerified=${Boolean(checkingVerified)}&account=${account}`
		);
		if (error) {
			handleSetStates(fieldName, false, VerificationStatus.NOT_VERIFIED, false);
			setFieldLoading({ ...fieldLoading, [fieldName]: false });
			setLoading(false);
		}
		if (data) {
			if (data?.message === VerificationStatus.ALREADY_VERIFIED) {
				handleSetStates(fieldName, true, VerificationStatus.ALREADY_VERIFIED);
				setFieldLoading({ ...fieldLoading, [fieldName]: false });
			} else if (checkingVerified && data?.message === VerificationStatus.VERFICATION_EMAIL_SENT) {
				setFieldLoading({ ...fieldLoading, [fieldName]: false });
				if (ESocials.EMAIL === fieldName) {
					handleSetStates(fieldName, false, VerificationStatus.VERFICATION_EMAIL_SENT);
				} else if (ESocials.TWITTER === fieldName) {
					handleSetStates(fieldName, false, VerificationStatus.PLEASE_VERIFY_TWITTER);
				}
			} else if (!checkingVerified || isNotificaiton) {
				setStatus({ ...status, email: VerificationStatus?.VERFICATION_EMAIL_SENT });
				queueNotification({
					header: 'Success!',
					message: 'Verification email sent successfully',
					status: NotificationStatus.SUCCESS
				});
				if (fieldName === ESocials.EMAIL) {
					closeModal(true);
					setOpen(true);
				}
			}
			setFieldLoading({ ...fieldLoading, [fieldName]: false });
		}

		setLoading(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	};

	const handleTwitterVerification = async () => {
		setLoading(true);
		const twitterHandle = socials?.twitter?.value?.split('@')?.[1] || socials?.twitter?.value;
		const { data, error } = await nextApiClientFetch<{ url?: string }>(`api/v1/verification/twitter-verification?twitterHandle=${twitterHandle}`);

		if (data && data?.url) {
			window.open(data?.url, '_blank');
		} else if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			console.log(error);
		}
		setLoading(false);
	};

	const handleJudgement = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<IJudgementResponse>('api/v1/verification/judgement-call', {
			identityHash,
			userAddress: address
		});

		if (data) {
			const { data: apiData, error: err } = await nextApiClientFetch('api/v1/verification/onchain-identity-via-polkassembly');
			if (apiData) {
				console.log('identity_via_polkassembly key set');
			} else {
				console.log(err);
			}
			localStorage.removeItem('identityForm');
			localStorage.removeItem('identityAddress');
			localStorage.removeItem('identityWallet');
			setOpenSuccessModal(true);
			closeModal(true);
			setLoading(false);
			setOpenSuccessModal(true);
			closeModal(true);
		} else if (error) {
			queueNotification({
				header: 'Error!',
				message: error,
				status: NotificationStatus.ERROR
			});
			setLoading(false);
			console.log(error);
		}
	};

	useEffect(() => {
		(async () => {
			await handleVerify(ESocials.TWITTER, true);
		})();
		(async () => {
			await handleVerify(ESocials.EMAIL, true);
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleProceedDisabled = () => {
		let socialsCount = 0;
		let verifiedCount = 0;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(socials).forEach(([key, value]) => {
			if (value?.value) {
				socialsCount += 1;
			}
			if (value?.verified) {
				verifiedCount += 1;
			}
		});
		return socialsCount !== verifiedCount;
	};

	return (
		<div className={`${className} border-solid border-white pl-4`}>
			<Timeline
				className='mt-8'
				items={items}
			/>
			<div className='-mx-6 flex justify-end gap-4 rounded-[4px] border-0 border-t-[1px] border-solid border-[#E1E6EB] px-6 pt-5'>
				<Button
					onClick={onCancel}
					className='h-[40px] w-[134px] rounded-[4px] border-[1px] border-pink_primary text-sm tracking-wide text-pink_primary'
				>
					Cancel
				</Button>
				<Button
					onClick={handleJudgement}
					disabled={handleProceedDisabled()}
					className={`h-[40px] w-[134px] rounded-[4px] border-none bg-pink_primary text-sm tracking-wide text-white ${handleProceedDisabled() && 'opacity-50'}`}
				>
					Proceed
				</Button>
			</div>
			<InprogressState
				open={open}
				close={(close) => setOpen(!close)}
				openPreModal={(pre) => closeModal(!pre)}
				socials={socials}
				changeStep={changeStep}
				handleVerify={handleVerify}
			/>
		</div>
	);
};
export default styled(SocialVerification)`
.ant-timeline .ant-timeline-item-tail{
  border-inline-start: 2px solid rgba(5, 5, 5, 0) !important;
  background-image: linear-gradient(rgba(144,160,183) 33%, rgba(255,255,255,0) 0%) !important;
  background-position: right !important;
  background-size: 1.5px 7px !important;
  background-repeat: repeat-y !important ;
  cursor: pointer !important;
}
.ant-timeline .ant-timeline-item-content {
  inset-block-start: -12px;
`;
