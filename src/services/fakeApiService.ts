

async function convertBlobToWav(blob: Blob): Promise<Blob> {
    try {
        if (blob.type.includes("wav")) return blob;

        const audioContext = new (
            window.AudioContext || (window as any).webkitAudioContext
        )();
        const arrayBuffer = await blob.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length * numberOfChannels * 2;
        const buffer = new ArrayBuffer(44 + length);
        const view = new DataView(buffer);

        const writeString = (view: DataView, offset: number, string: string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + length, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numberOfChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numberOfChannels * 2, true);
        view.setUint16(32, numberOfChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, length, true);

        const channels = [];
        for (let i = 0; i < numberOfChannels; i++) {
            channels.push(audioBuffer.getChannelData(i));
        }

        let offset = 44;
        for (let i = 0; i < audioBuffer.length; i++) {
            for (let channel = 0; channel < numberOfChannels; channel++) {
                const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                view.setInt16(
                    offset,
                    sample < 0 ? sample * 0x8000 : sample * 0x7fff,
                    true,
                );
                offset += 2;
            }
        }

        return new Blob([buffer], { type: "audio/wav" });
    } catch (err) {
        console.error("Conversion failed, returning original blob:", err);
        return blob;
    }
}

export const fakeApiService = {
    submitAudio: async (blob: Blob, filename: string) => {
        const wavBlob = await convertBlobToWav(blob);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = filename.endsWith('.wav') ? filename : `${filename}.wav`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    assessPart2: async () => {
        await new Promise(resolve => setTimeout(resolve, 4000));
    }
};
