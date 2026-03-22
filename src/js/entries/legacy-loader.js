export function loadLegacyScripts(paths) {
	return paths.reduce((promise, path) => {
		return promise.then(() => {
			return new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = path;
				script.async = false;
				script.onload = () => resolve();
				script.onerror = () => reject(new Error(`Failed to load script: ${path}`));
				document.head.appendChild(script);
			});
		});
	}, Promise.resolve());
}