import { goto } from '$app/navigation';
import { page } from '$app/state';

const setURLSearchParam = (name: string, value?: string | number | null) => {
	const currentUrl = new URL(page.url);
	if (value) currentUrl.searchParams.set(name, encodeURI(String(value)));
	else currentUrl.searchParams.delete(name);

	return goto(currentUrl);
};

export const useURLSearchParam: (
	name: string
) => [string | null, (value?: string | number | null) => Promise<void>] = (name: string) => {
	const x = $derived.by(() => {
		return page.url.searchParams.get('search');
	});
	return [x, setURLSearchParam.bind(null, name)];
};
