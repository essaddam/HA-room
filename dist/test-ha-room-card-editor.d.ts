/**
 * Test file to validate the HA Room Card Editor functionality
 * This file can be used in a browser console to test the editor
 */
declare global {
    interface Window {
        customCards?: Array<{
            type: string;
            name: string;
            description: string;
            preview: boolean;
            documentationURL: string;
            schemaURL: string;
        }>;
        testHARoomCardEditor?: () => boolean;
        testHACSCompatibility?: () => boolean;
    }
}
export {};
//# sourceMappingURL=test-ha-room-card-editor.d.ts.map