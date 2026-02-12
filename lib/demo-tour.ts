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
        // Floor navigation: archway to kitchen
        {
          id: 'lr-to-kitchen',
          type: 'navigation',
          position: { yaw: -120, pitch: -30 },
          tooltip: 'Walk to Kitchen',
          targetScene: 'kitchen',
        },
        // Floor navigation: hallway to bedroom
        {
          id: 'lr-to-bedroom',
          type: 'navigation',
          position: { yaw: 140, pitch: -28 },
          tooltip: 'Walk to Bedroom',
          targetScene: 'bedroom',
        },
        // Floor navigation: glass doors to garden
        {
          id: 'lr-to-patio',
          type: 'navigation',
          position: { yaw: 30, pitch: -32 },
          tooltip: 'Walk to Garden',
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
        // Floor navigation: stairs to studio loft (3D walkable)
        {
          id: 'lr-to-loft',
          type: 'navigation',
          position: { yaw: 80, pitch: -25 },
          tooltip: 'Walk to Studio Loft (3D)',
          targetScene: 'studio-loft',
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
        // Floor navigation: archway back to living room
        {
          id: 'k-to-living',
          type: 'navigation',
          position: { yaw: -130, pitch: -28 },
          tooltip: 'Walk to Living Room',
          targetScene: 'living-room',
        },
        // Floor navigation: toward bedroom through hallway
        {
          id: 'k-to-bedroom',
          type: 'navigation',
          position: { yaw: 170, pitch: -25 },
          tooltip: 'Walk to Bedroom',
          targetScene: 'bedroom',
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
        // Floor navigation: glass door to garden
        {
          id: 'k-to-patio',
          type: 'navigation',
          position: { yaw: -20, pitch: -30 },
          tooltip: 'Walk to Garden',
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
        // Floor navigation: door back to living room
        {
          id: 'b-to-living',
          type: 'navigation',
          position: { yaw: -140, pitch: -28 },
          tooltip: 'Walk to Living Room',
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
        // Floor navigation: door to kitchen
        {
          id: 'b-to-kitchen',
          type: 'navigation',
          position: { yaw: 155, pitch: -25 },
          tooltip: 'Walk to Kitchen',
          targetScene: 'kitchen',
        },
        // Floor navigation: toward garden through side door
        {
          id: 'b-to-patio',
          type: 'navigation',
          position: { yaw: -60, pitch: -30 },
          tooltip: 'Walk to Garden',
          targetScene: 'patio',
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
        // Floor navigation: stone path back to living room
        {
          id: 'p-to-living',
          type: 'navigation',
          position: { yaw: -160, pitch: -30 },
          tooltip: 'Walk to Living Room',
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
        // Floor navigation: path toward kitchen
        {
          id: 'p-to-kitchen',
          type: 'navigation',
          position: { yaw: 140, pitch: -28 },
          tooltip: 'Walk to Kitchen',
          targetScene: 'kitchen',
        },
        // Floor navigation: path toward bedroom
        {
          id: 'p-to-bedroom',
          type: 'navigation',
          position: { yaw: 80, pitch: -32 },
          tooltip: 'Walk to Bedroom',
          targetScene: 'bedroom',
        },
      ],
    },
    {
      id: 'studio-loft',
      name: 'Studio Loft',
      description: 'A minimalist 3D studio loft — walk freely with WASD',
      mode: 'walkable',
      imageUrl: '',
      initialView: { yaw: 0, pitch: 0, fov: 70 },
      walkableConfig: {
        roomWidth: 10,
        roomDepth: 8,
        roomHeight: 3.2,
        wallColor: '#666666',
        floorColor: '#444444',
        ceilingColor: '#555555',
        spawnPosition: { x: 0, y: 1.7, z: 3 },
        spawnLookAt: { x: 0, y: 1.5, z: -1 },
        furniture: [
          // Sofa — long box
          {
            id: 'sofa',
            type: 'box',
            position: { x: 3, y: 0.4, z: -1 },
            scale: { x: 2.4, y: 0.8, z: 0.9 },
            color: '#555555',
            label: 'Sofa',
          },
          // Sofa backrest
          {
            id: 'sofa-back',
            type: 'box',
            position: { x: 3, y: 0.75, z: -1.4 },
            scale: { x: 2.4, y: 0.7, z: 0.15 },
            color: '#4a4a4a',
            label: 'Sofa Back',
          },
          // Coffee table
          {
            id: 'coffee-table',
            type: 'box',
            position: { x: 0.5, y: 0.25, z: -1 },
            scale: { x: 1.2, y: 0.5, z: 0.6 },
            color: '#3a3a3a',
            label: 'Coffee Table',
          },
          // Desk
          {
            id: 'desk',
            type: 'box',
            position: { x: 3, y: 0.4, z: -3.2 },
            scale: { x: 1.6, y: 0.8, z: 0.7 },
            color: '#4e4e4e',
            label: 'Desk',
          },
          // Monitor on desk
          {
            id: 'monitor',
            type: 'box',
            position: { x: 3, y: 1.1, z: -3.3 },
            scale: { x: 0.8, y: 0.5, z: 0.05 },
            color: '#222222',
            emissive: '#8888ff',
            label: 'Monitor',
            collision: false,
          },
          // Bookshelf
          {
            id: 'bookshelf',
            type: 'box',
            position: { x: -3, y: 1.0, z: -3.5 },
            scale: { x: 1.8, y: 2.0, z: 0.4 },
            color: '#5a4a3a',
            label: 'Bookshelf',
          },
          // Accent chair
          {
            id: 'chair',
            type: 'box',
            position: { x: 2, y: 0.35, z: 2 },
            scale: { x: 0.7, y: 0.7, z: 0.7 },
            color: '#666666',
            label: 'Accent Chair',
          },
          // Area rug (flat, no collision)
          {
            id: 'rug',
            type: 'box',
            position: { x: 0, y: 0.01, z: 0 },
            scale: { x: 4, y: 0.02, z: 3 },
            color: '#555050',
            label: 'Area Rug',
            collision: false,
          },
          // Ceiling lamp
          {
            id: 'ceiling-lamp',
            type: 'cylinder',
            position: { x: 0, y: 3.0, z: 0 },
            scale: { x: 0.5, y: 0.2, z: 0.5 },
            color: '#aaaaaa',
            emissive: '#ffffff',
            label: 'Ceiling Lamp',
            collision: false,
          },
          // Side table next to sofa
          {
            id: 'side-table',
            type: 'cylinder',
            position: { x: 4.3, y: 0.3, z: -1 },
            scale: { x: 0.5, y: 0.6, z: 0.5 },
            color: '#4e4e4e',
            label: 'Side Table',
          },
          // Floor lamp
          {
            id: 'floor-lamp',
            type: 'cylinder',
            position: { x: -4.2, y: 0.9, z: 2.5 },
            scale: { x: 0.15, y: 1.8, z: 0.15 },
            color: '#777777',
            emissive: '#ffddaa',
            label: 'Floor Lamp',
          },
          // Wall art frame (left wall)
          {
            id: 'wall-art-frame',
            type: 'box',
            position: { x: -4.95, y: 1.7, z: 0 },
            rotation: { x: 0, y: Math.PI / 2, z: 0 },
            scale: { x: 1.5, y: 1.0, z: 0.05 },
            color: '#eeeeee',
            label: 'Wall Art',
            collision: false,
          },
          // Baseboard strip (front wall)
          {
            id: 'baseboard-front',
            type: 'box',
            position: { x: 0, y: 0.05, z: -3.98 },
            scale: { x: 10, y: 0.1, z: 0.04 },
            color: '#888888',
            label: 'Baseboard',
            collision: false,
          },
          // Baseboard strip (back wall)
          {
            id: 'baseboard-back',
            type: 'box',
            position: { x: 0, y: 0.05, z: 3.98 },
            scale: { x: 10, y: 0.1, z: 0.04 },
            color: '#888888',
            label: 'Baseboard',
            collision: false,
          },
          // Baseboard strip (left wall)
          {
            id: 'baseboard-left',
            type: 'box',
            position: { x: -4.98, y: 0.05, z: 0 },
            scale: { x: 0.04, y: 0.1, z: 8 },
            color: '#888888',
            label: 'Baseboard',
            collision: false,
          },
          // Baseboard strip (right wall)
          {
            id: 'baseboard-right',
            type: 'box',
            position: { x: 4.98, y: 0.05, z: 0 },
            scale: { x: 0.04, y: 0.1, z: 8 },
            color: '#888888',
            label: 'Baseboard',
            collision: false,
          },
        ],
        lights: [
          { type: 'ambient', color: '#ffffff', intensity: 0.6 },
          { type: 'point', color: '#ffffff', intensity: 3.0, position: { x: 0, y: 2.9, z: 0 }, distance: 15 },
          { type: 'point', color: '#ffffff', intensity: 2.0, position: { x: 3, y: 2.9, z: -2 }, distance: 10 },
          { type: 'point', color: '#ffffff', intensity: 2.0, position: { x: -3, y: 2.9, z: -2 }, distance: 10 },
          { type: 'point', color: '#ffffff', intensity: 1.5, position: { x: 0, y: 2.9, z: 3 }, distance: 10 },
          { type: 'spot', color: '#ffffff', intensity: 3.0, position: { x: 3, y: 2.5, z: -3 }, target: { x: 3, y: 0.8, z: -3.2 }, distance: 6, angle: 0.6, penumbra: 0.5 },
          { type: 'point', color: '#ffddaa', intensity: 1.5, position: { x: -4.2, y: 1.8, z: 2.5 }, distance: 6 },
        ],
      },
      hotspots: [
        // Navigation: door back to living room
        {
          id: 'loft-to-living',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 0, y: 0.1, z: 3.8 },
          tooltip: 'Walk to Living Room',
          targetScene: 'living-room',
        },
        // Info: bookshelf
        {
          id: 'loft-bookshelf',
          type: 'info',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: -3, y: 1.5, z: -3.2 },
          tooltip: 'Book Collection',
          title: 'Curated Library',
          content: 'A floor-to-ceiling bookshelf housing a curated collection of architecture, design, and photography monographs. The spines create a subtle texture against the dark wall.',
        },
        // Info: workspace
        {
          id: 'loft-desk',
          type: 'info',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 3, y: 1.3, z: -3.0 },
          tooltip: 'Workspace',
          title: 'Minimalist Workspace',
          content: 'A sleek workstation with an ultra-wide monitor. The clean desk philosophy extends to the entire loft, with all cables hidden in concealed channels.',
        },
        // Image: wall art
        {
          id: 'loft-art',
          type: 'image',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: -4.9, y: 1.7, z: 0 },
          tooltip: 'Wall Art',
          title: 'Abstract Monochrome',
          imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80',
          imageAlt: 'Abstract black and white wall art',
        },
        // Navigation: to kitchen
        {
          id: 'loft-to-kitchen',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: -4.5, y: 0.1, z: -3.5 },
          tooltip: 'Walk to Kitchen',
          targetScene: 'kitchen',
        },
        // Floor teleport hotspots (for mobile navigation within the room)
        {
          id: 'tp-center',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 0, y: 0.1, z: 0 },
          tooltip: 'Move here',
          teleportTo: { x: 0, y: 1.7, z: 0 },
        },
        {
          id: 'tp-near-bookshelf',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: -3, y: 0.1, z: -2 },
          tooltip: 'Move here',
          teleportTo: { x: -3, y: 1.7, z: -2 },
        },
        {
          id: 'tp-near-desk',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 1.5, y: 0.1, z: -2.5 },
          tooltip: 'Move here',
          teleportTo: { x: 1.5, y: 1.7, z: -2.5 },
        },
        {
          id: 'tp-left-side',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: -3, y: 0.1, z: 1.5 },
          tooltip: 'Move here',
          teleportTo: { x: -3, y: 1.7, z: 1.5 },
        },
        {
          id: 'tp-right-side',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 1.5, y: 0.1, z: 1.5 },
          tooltip: 'Move here',
          teleportTo: { x: 1.5, y: 1.7, z: 1.5 },
        },
        {
          id: 'tp-far-right',
          type: 'navigation',
          position: { yaw: 0, pitch: 0 },
          position3d: { x: 4, y: 0.1, z: 1.5 },
          tooltip: 'Move here',
          teleportTo: { x: 4, y: 1.7, z: 1.5 },
        },
      ],
    },
  ],
};
