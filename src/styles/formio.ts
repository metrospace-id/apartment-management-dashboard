const primary = '#0369a1'
const secondary = '#a10369'
const tertiary = '#f9ffe6'

export const themeExtends = {
  colors: {
    primary: {
      DEFAULT: primary,
      50: '#f0faff',
      100: '#e0f3fe',
      200: '#bae5fd',
      300: '#7dcffc',
      400: '#38b4f8',
      500: '#0e9be9',
      600: '#0281c7',
      700: '#0369a1',
      800: '#075885',
      900: '#0c4b6e'
    },
    secondary: {
      DEFAULT: secondary,
      50: '#fff0fc',
      100: '#ffe3fb',
      200: '#ffc6f7',
      300: '#ff98ee',
      400: '#ff58e0',
      500: '#ff28cd',
      600: '#ff28cd',
      700: '#df008d',
      800: '#b80075',
      900: '#a10369'
    },
    tertiary: {
      DEFAULT: tertiary,
      50: '#f9ffe6',
      100: '#f0ffc8',
      200: '#e1ff97',
      300: '#c9fb5b',
      400: '#b2f229',
      500: '#92d80a',
      600: '#69a103',
      700: '#558308',
      800: '#45670d',
      900: '#3a5710'
    },
    'gray-darker': '#504747'
  },
  spacing: {
    7.5: '1.875rem', // 30px
    15: '3.75rem', // 60px
    22: '5.5rem', // 88px
    25: '6.25rem', // 100px
    26: '6.5rem', // 104px
    30: '8.5rem', // 136px
    32: '9rem', // 144px
    68: '17rem' // 272px
  },
  padding: {
    px: '1px'
  },
  margin: {
    px: '1px',
    '-px': '-1px',
    '-2px': '-2px',
    auto: 'auto'
  },
  fontSize: {
    micro: '.5rem', // 8px
    xxs: '.625rem', // 10px
    md: '1rem' // 16px
  },
  fontWeight: {
    hairline: 100
  },
  fontFamily: {
    brand: ['Source Sans Pro', 'sans-serif'],
    sans: ['Source Sans Pro', 'sans-serif'],
    serif: ['Source Sans Pro', 'sans-serif'],
    inconsolata: ['Inconsolata'],
    source: [
      'source-code-pro',
      'Menlo',
      'Monaco',
      'Consolas',
      'Courier New',
      'monospace'
    ]
  },
  minWidth: {
    site: '18.75rem',
    'input-mini': '17.5rem',
    'input-small': '31.25rem',
    'input-medium': '36.3125rem',
    'input-large': '61.45rem',
    'button-mini': '5.5rem',
    'button-small': '7rem',
    'button-medium': '9.875rem',
    'button-large': '10rem'
  },
  width: {
    arrow: '.8rem',
    '3/10': '30%',
    '7/10': '70%',
    '9/10': '90%',
    '12/25': '48%'
  },
  maxWidth: {
    sm: '30rem',
    md: '40rem',
    lg: '50rem',
    xl: '60rem',
    '2xl': '70rem',
    '3xl': '80rem',
    '4xl': '90rem',
    '5xl': '100rem',
    '1/4': '25%',
    '1/2': '50%',
    '3/5': '60%',
    '4/5': '80%',
    '9/10': '90%',
    'site-mini': '17.5rem',
    'site-small': '31.25rem',
    'site-medium': '43.75rem',
    'site-large': '56.25rem',
    site: '73.75rem',
    screen: '100vw'
  },
  height: {
    arrow: '.4rem',
    px: '1px',
    4: '1rem',
    5: '1.25rem',
    8: '1.8rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    16: '4rem',
    24: '6rem',
    32: '8rem'
  },
  borderWidth: {
    1: '1px',
    5: '5px'
  },
  borderRadius: {
    half: '50%',
    full: '100%'
  },
  zIndex: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6
  },
  fill: {
    transparent: 'transparent'
  },
  flex: {
    2: '2 2 0%',
    3: '3 3 0%'
  }
}

export const themeOutline = {
  none: ['2px solid transparent', '2px'],
  white: ['2px dotted white', '2px'],
  black: ['2px dotted black', '2px']
}
