import { sample, shuffle } from "lodash"

export const colors: string[] = [
    "#b71c1c",
    "#880e4f",
    "#4a148c",
    "#1a237e",
    "#311b92",
    "#01579b",
    "#006064",
    "#004d40",
    "#1b5e20",
    "#33691e",
    "#827717",
    "#f57f17",
    "#e65100",
    "#bf360c",
    "#3e2723",
    "#212121",
    "#263238",
]

export const newColor = () => sample(shuffle(colors)) as string;

