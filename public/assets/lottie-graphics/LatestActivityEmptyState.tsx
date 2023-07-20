// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { ReactElement, useState } from 'react';
import Lottie from 'react-lottie-player';

import LatestActivityJson from './lottie-files/latest-activity.json';
import Slash from './Slash.svg';

interface Props {
    width?: number;
}

function LatestActivityEmptyState({ width = 80 }: Props): ReactElement {
    const [playing, setPlaying] = useState(false);

    return (
        <div>
            <img
                src={Slash}
                style={{
                    left: '50%',
                    opacity: '70%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '70px',
                }}
            />
            <Lottie
                animationData={LatestActivityJson}
                style={{
                    height: width,
                    left: '50%',
                    position: 'absolute',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: width,
                }}
                onMouseEnter={() => setPlaying(true)}
                onMouseLeave={() => setPlaying(false)}
                play={playing}
                goTo={playing ? undefined : 50}
            />
        </div>
    );
}

export default LatestActivityEmptyState;
