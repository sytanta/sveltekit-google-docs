const colorByUserName = (name: string) => {
	const numberByName = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
	const hue = Math.abs(numberByName) % 360;
	return `hsl(${hue}, 80%, 60%)`;
};

export default colorByUserName;
