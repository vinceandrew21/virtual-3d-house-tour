import { TourConfig } from '@/types/tour';

export const demoTour: TourConfig = {
  id: 'demo-house-tour',
  name: 'Modern Living Space',
  description: 'Explore this beautifully designed property featuring a grand living room, rustic kitchen, modern bedroom suite, and a tranquil Chinese garden.',
  author: 'Virtual Tours Studio',
  defaultScene: 'living-room',
  scenes: [
    {
      id: 'living-room',
      name: 'Living Room',
      description: 'A grand lounge with warm lighting, plush sofas, and elegant decor',
      imageUrl: '/tours/demo/living-room.jpg',
      initialView: { yaw: 0, pitch: 0, fov: 75 },
      hotspots: [
        // Navigation: doorway/arch area to kitchen (left side, near the arch)
        {
          id: 'lr-to-kitchen',
          type: 'navigation',
          position: { yaw: -120, pitch: -5 },
          tooltip: 'Go to Kitchen',
          targetScene: 'kitchen',
        },
        // Navigation: toward the right hallway area to bedroom
        {
          id: 'lr-to-bedroom',
          type: 'navigation',
          position: { yaw: 140, pitch: -5 },
          tooltip: 'Go to Bedroom',
          targetScene: 'bedroom',
        },
        // Navigation: glass doors at center-right lead to patio
        {
          id: 'lr-to-patio',
          type: 'navigation',
          position: { yaw: 30, pitch: -8 },
          tooltip: 'Go to Garden',
          targetScene: 'patio',
        },
        // Info: the cream sofas in the center area
        {
          id: 'lr-sofa-info',
          type: 'info',
          position: { yaw: 60, pitch: -18 },
          tooltip: 'Seating Area',
          title: 'Curved Sofa Arrangement',
          content: 'A generous L-shaped sofa arrangement upholstered in cream fabric, surrounding a rustic wooden coffee table. The layout creates an inviting conversation area anchoring the room.',
        },
        // Info: the stone feature wall behind the daybed
        {
          id: 'lr-stone-wall',
          type: 'info',
          position: { yaw: -10, pitch: 5 },
          tooltip: 'Stone Feature Wall',
          title: 'Natural Stone Accent',
          content: 'A dramatic natural stone accent wall adds texture and visual weight to the lounge. The rough-hewn stonework contrasts beautifully with the smooth plastered ceiling and warm ambient lighting.',
        },
        // Image: chandelier/light fixture visible in the archway
        {
          id: 'lr-chandelier',
          type: 'image',
          position: { yaw: -90, pitch: 20 },
          tooltip: 'Chandelier Detail',
          title: 'Crystal Chandelier',
          imageUrl: 'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800&q=80',
          imageAlt: 'Elegant crystal chandelier hanging in archway',
        },
      ],
    },
    {
      id: 'kitchen',
      name: 'Kitchen & Lounge',
      description: 'A rustic open-plan kitchen with thatched ceiling and natural light',
      imageUrl: '/tours/demo/kitchen.jpg',
      initialView: { yaw: 0, pitch: 0, fov: 75 },
      hotspots: [
        // Navigation: archway on the left leads back to living room
        {
          id: 'k-to-living',
          type: 'navigation',
          position: { yaw: -130, pitch: -2 },
          tooltip: 'Back to Living Room',
          targetScene: 'living-room',
        },
        // Info: refrigerator and kitchen area on the right
        {
          id: 'k-fridge',
          type: 'info',
          position: { yaw: 120, pitch: -5 },
          tooltip: 'Kitchen Area',
          title: 'Rustic Kitchen',
          content: 'A fully equipped kitchen featuring a stainless steel refrigerator, wooden cabinetry, and warm countertops that complement the thatched roof overhead.',
        },
        // Info: the couch/sitting area in the center
        {
          id: 'k-couch',
          type: 'info',
          position: { yaw: 20, pitch: -15 },
          tooltip: 'Lounge Seating',
          title: 'Open-Plan Lounge Area',
          content: 'A comfortable sofa sits beneath large windows, creating a bright reading nook within the open-plan kitchen-lounge. Natural light floods in through the glass doors.',
        },
        // Info: thatched ceiling - unique architectural feature
        {
          id: 'k-ceiling',
          type: 'info',
          position: { yaw: 0, pitch: 45 },
          tooltip: 'Thatched Ceiling',
          title: 'Traditional Thatch Roof',
          content: 'The beautifully crafted thatched ceiling brings a warm, rustic character to the space. This traditional technique provides natural insulation and adds organic texture overhead.',
        },
        // Navigation: glass door at center leads to patio
        {
          id: 'k-to-patio',
          type: 'navigation',
          position: { yaw: -20, pitch: -5 },
          tooltip: 'Go to Garden',
          targetScene: 'patio',
        },
      ],
    },
    {
      id: 'bedroom',
      name: 'Master Bedroom',
      description: 'A sleek modern hotel-style bedroom with ambient lighting',
      imageUrl: '/tours/demo/bedroom.jpg',
      initialView: { yaw: 0, pitch: 0, fov: 75 },
      hotspots: [
        // Navigation: door on far left leads back to living room
        {
          id: 'b-to-living',
          type: 'navigation',
          position: { yaw: -140, pitch: -3 },
          tooltip: 'Back to Living Room',
          targetScene: 'living-room',
        },
        // Info: the king bed on the right side
        {
          id: 'b-bed-info',
          type: 'info',
          position: { yaw: 90, pitch: -10 },
          tooltip: 'King Bed',
          title: 'Premium King Bed',
          content: 'A luxurious king-size bed with an upholstered headboard featuring warm LED accent lighting. The olive-green bedding adds a contemporary touch against the neutral palette.',
        },
        // Info: the work desk and TV area on the left
        {
          id: 'b-desk',
          type: 'info',
          position: { yaw: -40, pitch: -10 },
          tooltip: 'Work Area',
          title: 'Executive Desk',
          content: 'A curved executive desk in dark wood with an ergonomic chair, positioned beneath a wall-mounted flatscreen TV. Modern pendant lights hang above for focused task lighting.',
        },
        // Image: curtained window at center
        {
          id: 'b-window',
          type: 'image',
          position: { yaw: 10, pitch: 5 },
          tooltip: 'Window View',
          title: 'City View',
          imageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80',
          imageAlt: 'City skyline view through bedroom window',
        },
        // Info: green accent chair
        {
          id: 'b-chair',
          type: 'info',
          position: { yaw: -5, pitch: -18 },
          tooltip: 'Accent Chair',
          title: 'Designer Accent Chair',
          content: 'A striking chartreuse upholstered armchair provides a bold pop of color. Positioned by the window, it creates a cozy reading corner within the suite.',
        },
        // Navigation: bathroom door on the right
        {
          id: 'b-to-kitchen',
          type: 'navigation',
          position: { yaw: 155, pitch: -3 },
          tooltip: 'Go to Kitchen',
          targetScene: 'kitchen',
        },
      ],
    },
    {
      id: 'patio',
      name: 'Chinese Garden',
      description: 'A tranquil Chinese garden with a koi pond, pagoda, and lush greenery',
      imageUrl: '/tours/demo/patio.jpg',
      initialView: { yaw: 0, pitch: 0, fov: 80 },
      hotspots: [
        // Navigation: stone path behind leads back to living room
        {
          id: 'p-to-living',
          type: 'navigation',
          position: { yaw: -160, pitch: -10 },
          tooltip: 'Back to Living Room',
          targetScene: 'living-room',
        },
        // Info: the koi pond at center
        {
          id: 'p-pond',
          type: 'info',
          position: { yaw: 5, pitch: -20 },
          tooltip: 'Koi Pond',
          title: 'Ornamental Koi Pond',
          content: 'A serene koi pond with lily pads and a traditional stone lantern at its center. The pond is fed by natural springs and surrounded by carefully placed scholar rocks.',
        },
        // Info: pagoda structure on the left
        {
          id: 'p-pagoda',
          type: 'info',
          position: { yaw: -50, pitch: 10 },
          tooltip: 'Pagoda',
          title: 'Garden Pagoda',
          content: 'A traditional red-lacquered pagoda rises above the garden canopy. Its tiered roof and ornate eaves exemplify classical Chinese garden architecture.',
        },
        // Info: wooden pavilion on the right
        {
          id: 'p-pavilion',
          type: 'info',
          position: { yaw: 70, pitch: 0 },
          tooltip: 'Tea Pavilion',
          title: 'Covered Pavilion',
          content: 'A traditional wooden pavilion provides a shaded retreat for tea ceremonies. Its open design allows gentle breezes to flow through while framing views of the garden.',
        },
        // Image: the stone pathway
        {
          id: 'p-path',
          type: 'image',
          position: { yaw: -100, pitch: -25 },
          tooltip: 'Cobblestone Path',
          title: 'Traditional Cobblestone Pathway',
          imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80',
          imageAlt: 'Traditional cobblestone pathway through a Chinese garden',
        },
        // Navigation: path toward kitchen
        {
          id: 'p-to-kitchen',
          type: 'navigation',
          position: { yaw: 140, pitch: -8 },
          tooltip: 'Go to Kitchen',
          targetScene: 'kitchen',
        },
      ],
    },
  ],
};
