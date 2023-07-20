// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Tag } from 'antd';
import React from 'react';
import styled from 'styled-components';

interface Props {
    className?: string;
    topic: string;
}

const TopicTag = ({ className, topic }: Props) => {
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
        background-color: #eef8ff !important;
        color: #093874;
    }
    &.Council {
        background-color: #ffedf2 !important;
        color: #cd1f59;
    }
    &.Treasury {
        background-color: #fff4eb !important;
        color: #ac6a30;
    }
    &.Technical,
    &.Tech {
        background-color: #fef7dd !important;
        color: #75610e;
    }
`;
