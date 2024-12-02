declare module 'spin-wheel' {
    type AlignText = 'left' | 'right' | 'center'; // Define the AlignText type if it's not imported.

    interface WheelItem {
      /**
       * The label for the item.
       */
      label?: string;

      /**
       * The weight of the item, which may affect its likelihood of selection.
       */
      weight?: number;

      /**
       * The background color for the item.
       */
      backgroundColor?: string;

      /**
       * The label color for the item.
       */
      labelColor?: string;

      /**
       * An image associated with the item.
       */
      image?: string;

      /**
       * The radius of the image for the item.
       */
      imageRadius?: number;

      /**
       * The scale of the image for the item.
       */
      imageScale?: number;

      /**
       * Optionally include additional properties for customization.
       */
      [key: string]: any;
    }

    interface WheelProps {
      /**
       * The name of the wheel (for identification or display purposes).
       */
      name?: string;

      /**
       * The radius of the wheel as a fraction of its container.
       */
      radius?: number;

      /**
       * The angle of the pointer relative to the wheel's start position.
       */
      pointerAngle?: number;

      /**
       * The radius for item labels as a fraction of the wheel's radius.
       */
      itemLabelRadius?: number;

      /**
       * The maximum radius for item labels as a fraction of the wheel's radius.
       */
      itemLabelRadiusMax?: number;

      /**
       * The rotation angle for item labels.
       */
      itemLabelRotation?: number;

      /**
       * The alignment of the text for item labels.
       */
      itemLabelAlign?: AlignText;

      /**
       * Colors for item labels.
       */
      itemLabelColors?: string[];

      /**
       * Baseline offset for item labels.
       */
      itemLabelBaselineOffset?: number;

      /**
       * Font used for item labels.
       */
      itemLabelFont?: string;

      /**
       * Maximum font size for item labels.
       */
      itemLabelFontSizeMax?: number;

      /**
       * Background colors for items on the wheel.
       */
      itemBackgroundColors?: string[];

      /**
       * The maximum rotation speed of the wheel.
       */
      rotationSpeedMax?: number;

      /**
       * The resistance applied during the wheel's rotation.
       */
      rotationResistance?: number;

      /**
       * Line width for the wheel's border or divisions.
       */
      lineWidth?: number;

      /**
       * Line color for the wheel's border or divisions.
       */
      lineColor?: string;

      /**
       * Image used as a background for the wheel.
       */
      image?: string;

      /**
       * Overlay image used for the wheel.
       */
      overlayImage?: string;

      /**
       * The width of the border for the wheel.
       */
      borderWidth?: number;

      /**
       * The color of the border for the wheel.
       */
      borderColor?: string;

      /**
       * An array of items to be displayed on the wheel.
       */
      items: WheelItem[];

      /**
       * Optionally define additional properties for customization.
       */
      [key: string]: any;
    }

    class Wheel {
      /**
       * Constructs a new Wheel instance.
       * @param container - The DOM element where the wheel will be rendered.
       * @param props - Configuration properties for the wheel.
       */
      constructor(container: HTMLElement | null, props: WheelProps);

      /**
       * Spins the wheel with optional configurations.
       * Add more detailed method signatures as needed.
       */
      spin(): void;

      /**
       * Destroys the wheel and cleans up resources.
       */
      destroy(): void;
    }

    export { Wheel, WheelProps, WheelItem, AlignText };
  }
