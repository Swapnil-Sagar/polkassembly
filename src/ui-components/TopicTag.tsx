// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props{
	className?: string,
	topic: string,
	theme?: string
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const TopicTag = ({ className, topic,theme }: Props) => {

	return (
		<Tag className={`${className} ${topic} text-xs py-1 px-3`}>{topic}</Tag>
	);
};

export default styled(TopicTag)`
	font-weight: 500;
	background-color: var(--grey_primary);
	color: white;
	border: none;
	border-radius: 5px;
	text-transform: capitalize;

	@media only screen and (max-width: 576px) {
		padding: 0.2rem 0.4rem;
	}

	&.Democracy {
		background-color: ${props => props.theme === 'dark'? '#1C2945':'#EEF8FF'} !important;
		color: ${props => props.theme === 'dark'? '#96AAD6':'#093874'} !important; 
	}
	&.Council {
		background-color: ${props => props.theme === 'dark'? '#0B353C':'#FFEDF2'} !important;  
		color: ${props => props.theme === 'dark'? '#93C9D1':'#CD1F59'}; 
	}
	&.Treasury {
		background-color: ${props => props.theme === 'dark'? '#302234':'#FFF4EB'} !important; 
		color: ${props => props.theme === 'dark'? '#CCAED4':'#AC6A30'} !important; 
	}
	&.Technical, &.Tech {
		background-color: #FEF7DD !important;
		color: #75610E;
	}
	&.General {
		background-color: ${props => props.theme === 'dark'? '#380E0E':'#FDF5F0'} !important;
		color: ${props => props.theme === 'dark'? '#DB8383':'#EF884A'} !important;
	}
`;
