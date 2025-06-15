function newDebounceFunc<T extends (...args: Parameters<T>) => ReturnType<T>>(
	callback: T,
	delay = 500
) {
	let timeout: number | undefined = undefined;

	const debounce: (...args: Parameters<T>) => void = (...args) => {
		if (timeout) clearTimeout(timeout);
		timeout = setTimeout(() => {
			callback(...args);
			clearTimeout(timeout);
		}, delay);
	};

	return debounce;
}

export { newDebounceFunc };
