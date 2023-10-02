// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { LinkOutlined } from '@ant-design/icons';
import { Alert, Form, Input } from 'antd';
import React, { FC } from 'react';
import { ProfileDetails } from '~src/auth/types';
import { socialLinks } from './Details';
import { SocialIcon } from '~src/ui-components/SocialLinks';
import styled from 'styled-components';

interface ISocialsProps {
    loading: boolean;
    setProfile: React.Dispatch<React.SetStateAction<ProfileDetails>>
    profile: ProfileDetails;
	errorCheck?: string | undefined;
	theme?: string;
}

const Socials: FC<ISocialsProps> = (props) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { loading, profile, setProfile , errorCheck, theme } = props;
	console.log(theme);
	return (
		<div className='max-h-[552px] flex flex-col gap-y-4'>
			{
				socialLinks.map((socialLink) => {
					const strLink = socialLink.toString();
					return (
						<Form key={strLink}>
							<label
								className='flex items-center gap-x-[6px] text-base cursor-pointer font-normal text-[#485F7D] dark:text-blue-dark-medium'
								htmlFor={strLink}
							>
								<SocialIcon type={socialLink} />
								<span>
									{strLink}
								</span>
							</label>
							<Input
								className='rounded-[4px] border border-solid border-[rgba(72,95,125,0.2)] text-[#1D2632] h-10 dark:bg-black dark:text-white dark:placeholder-white dark:focus:border-[#91054F] text-sm -mt-2 dark:border-[#3B444F] border-[1px]'
								size='large'
								prefix={<LinkOutlined className='text-[rgba(72,95,125,0.2)] mr-1.5 text-base' />}
								placeholder={`Enter ${strLink} ${strLink === 'Email'? '': 'URL'}`}
								onChange={(e) => {
									const value = e.target.value.trim();
									setProfile((prev) => {
										let isUpdated = false;
										const social_links = prev?.social_links?.map((link) => {
											if (link.type === strLink) {
												isUpdated = true;
												return {
													...link,
													link: value
												};
											}
											return {
												...link
											};
										}) || [];
										if (!isUpdated) {
											social_links.push({
												link: value,
												type: socialLink
											});
										}
										return {
											...prev,
											social_links
										};
									});
								}}
								value={profile?.social_links?.find((link) => link.type === strLink)?.link}
								disabled={loading}
							/>
						</Form>
					);
				})
			}
			{
				errorCheck &&
					<Alert
						className='mt-4 h-[40px] py-2 px-5 text-blue-light-high dark:text-blue-dark-high text-sm rounded-[4px]'
						message={errorCheck}
						type='info'
						showIcon
					/>
			}
		</div>
	);
};

export default styled(Socials)`
	.ant-input{
		background-color: ${props => props.theme === 'dark' ? '#0D0D0D' : 'white'} !important;
	}
`;