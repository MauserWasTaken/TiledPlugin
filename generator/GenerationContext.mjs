export class GenerationContext {

    constructor(
        writer,
        width,
        height
    )
    {
        this.writer = writer;

        this.width = width;
        this.height = height;

        this.random = Math.random;
    }
}