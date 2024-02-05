// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
export function getSubdomain(url: string) {
	const urlObj = new URL(url);
	const hostname = urlObj.hostname;
	const parts = hostname.split('.');
	if (parts.length > 2) {
		parts.pop();
		parts.pop();
		return parts.join('.');
	}
	return '';
}
