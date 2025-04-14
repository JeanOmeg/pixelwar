export const tiledPlugin = () => {
    return {
        name: 'tiled-tileset-plugin',
        resolveId: {
            order: 'pre',
            handler(sourceId: string) {
                if (!sourceId.endsWith(".tsx")) return;
                return { id: 'tileset:' + sourceId, external: 'relative' }
            }
        }
    };
}
