const abstract_content = `
        elif ("-vframes" in outputdict):
            self.inputframenum = int(outputdict["-vframes"])
        elif ("-r" in outputdict):
            inputfps = int(outputdict["-r"])
            inputduration = float(viddict[self.INFO_DURATION])
            self.inputframenum = int(round(inputfps * inputduration) + 1)
        elif (self.INFO_NB_FRAMES in viddict):
            self.inputframenum = int(viddict[self.INFO_NB_FRAMES])
        elif israw:
            # we can compute it based on the input size and color space
            self.inputframenum = int(self.size / (self.inputwidth * self.inputheight * (self.bpp / 8.0)))
`;
console.log(abstract_content);
