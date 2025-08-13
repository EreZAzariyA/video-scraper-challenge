import { useState } from "react";
import { copyText } from "../components/copy.js";

export function useCopy() {
	const [copyStatus, setCopyStatus] = useState(null);
	
	const copy = async (text) => {
		try {
			setCopyStatus('copying');
			const success = await copyText(text);
			if (success) {
				setCopyStatus('success');
				setTimeout(() => setCopyStatus(null), 2000);
			} else {
				setCopyStatus('error');
				setTimeout(() => setCopyStatus(null), 2000);
			}
		} catch (error) {
			setCopyStatus('error');
			setTimeout(() => setCopyStatus(null), 2000);
		}
	};

	return {
		copy,
		copyStatus,
		isLoading: copyStatus === 'copying',
		isSuccess: copyStatus === 'success',
		isError: copyStatus === 'error'
	};
}