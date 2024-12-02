declare module 'spin-wheel' {
    type AlignText = 'left' | 'right' | 'center';

    interface WheelItem {
      backgroundColor?: string; // The CSS color of the item's background.
      image?: string; // URL or path to an image to be displayed on the item.
      imageOpacity?: number; // Opacity of the image (0 to 1).
      imageRadius?: number; // The radius position (as a percent) for the item's image.
      imageRotation?: number; // The rotation (in degrees) of the item's image.
      imageScale?: number; // Scale factor for the item's image.
      label?: string; // The text displayed on the item.
      labelColor?: string; // The CSS color for the label text.
      value?: any; // A value associated with the item.
      weight?: number; // The proportional size of the item relative to others.
      getCenterAngle?: () => number; // Returns the center angle of the item.
      getEndAngle?: () => number; // Returns the end angle of the item.
      getIndex?: () => number; // Returns the 0-based index of the item.
      getRandomAngle?: () => number; // Returns a random angle within the item's bounds.
      getStartAngle?: () => number; // Returns the start angle of the item.
      init?: (props?: Partial<WheelItem>) => void; // Initializes the item's properties.
    }

    interface WheelProps {
      borderColor?: string; // CSS color for the wheel's border.
      borderWidth?: number; // Width (in pixels) of the wheel's border.
      debug?: boolean; // If true, debugging info will be shown.
      image?: string; // URL or path to an image drawn on the wheel.
      isInteractive?: boolean; // Whether the wheel can be spun interactively.
      itemBackgroundColors?: string[]; // Repeating pattern of CSS colors for item backgrounds.
      itemLabelAlign?: AlignText; // Alignment of the item labels.
      itemLabelBaselineOffset?: number; // Baseline offset for item labels (as a percent).
      itemLabelColors?: string[]; // Repeating pattern of CSS colors for item labels.
      itemLabelFont?: string; // Font family for item labels.
      itemLabelFontSizeMax?: number; // Maximum font size for item labels (in pixels).
      itemLabelRadius?: number; // Radius position for item labels (as a percent).
      itemLabelRadiusMax?: number; // Maximum radius for item label width (as a percent).
      itemLabelRotation?: number; // Rotation of item labels (in degrees).
      itemLabelStrokeColor?: string; // Stroke color for item labels.
      itemLabelStrokeWidth?: number; // Stroke width for item labels (in pixels).
      items: WheelItem[]; // Array of items to display on the wheel.
      lineColor?: string; // CSS color for the lines between items.
      lineWidth?: number; // Width (in pixels) of lines between items.
      offset?: { x: number; y: number }; // Offset of the wheel from its container's center.
      onCurrentIndexChange?: (event: { type: string; currentIndex: number }) => void; // Callback for when the current index changes.
      onRest?: (event: { type: string; currentIndex: number; rotation: number }) => void; // Callback for when the wheel comes to rest.
      onSpin?: (event: {
        type: string;
        duration?: number;
        method: string;
        rotationResistance?: number;
        rotationSpeed?: number;
        targetItemIndex?: number;
        targetRotation?: number;
      }) => void; // Callback for when the wheel is spun.
      overlayImage?: string; // URL or path to an overlay image.
      pixelRatio?: number; // Pixel ratio for rendering the wheel.
      pointerAngle?: number; // Angle of the pointer (in degrees).
      radius?: number; // Radius of the wheel (as a percent of container's smallest dimension).
      rotation?: number; // Initial rotation angle of the wheel.
      rotationResistance?: number; // Resistance applied to reduce rotation speed.
      rotationSpeedMax?: number; // Maximum rotation speed (in degrees per second).
    }

    class Wheel {
      constructor(container: HTMLElement | null, props?: Partial<WheelProps>);

      /**
       * Initializes the wheel with provided properties.
       * @param props - The properties to initialize the wheel with.
       */
      init(props?: Partial<WheelProps>): void;

      /**
       * Recalculates and redraws the wheel. Useful for legacy browsers.
       */
      resize(): void;

      /**
       * Removes the wheel from the DOM and unregisters event handlers.
       */
      remove(): void;

      /**
       * Spins the wheel with a specified rotation speed.
       * @param rotationSpeed - Speed of rotation (positive for clockwise, negative for counter-clockwise).
       */
      spin(rotationSpeed?: number): void;

      /**
       * Spins the wheel to a specific rotation.
       * @param rotation - Target rotation angle (in degrees).
       * @param duration - Duration of the spin (in milliseconds).
       * @param easingFunction - Optional easing function for the animation.
       */
      spinTo(
        rotation?: number,
        duration?: number,
        easingFunction?: (n: number) => number
      ): void;

      /**
       * Spins the wheel to a specific item.
       * @param itemIndex - Index of the target item.
       * @param duration - Duration of the spin (in milliseconds).
       * @param spinToCenter - Whether to spin to the item's center.
       * @param numberOfRevolutions - Number of 360-degree revolutions during the spin.
       * @param direction - Spin direction (1 for clockwise, -1 for counter-clockwise).
       * @param easingFunction - Optional easing function for the animation.
       */
      spinToItem(
        itemIndex?: number,
        duration?: number,
        spinToCenter?: boolean,
        numberOfRevolutions?: number,
        direction?: 1 | -1,
        easingFunction?: (n: number) => number
      ): void;

      /**
       * Stops the wheel from spinning immediately.
       */
      stop(): void;

      /**
       * Gets the current index of the item pointed at by the pointer.
       * @returns The index of the current item.
       */
      getCurrentIndex(): number;
    }

    export { Wheel, WheelProps, WheelItem, AlignText };
  }
