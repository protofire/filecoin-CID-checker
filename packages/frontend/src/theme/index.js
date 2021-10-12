const theme = {
  fonts: {
    defaultSize: '14px',
    fontFamily: `'Poppins'`,
    fontFamilyCode: `'Poppins', sans-serif`,
  },
  colors: {
    mainBodyBackgroundLeft: '#0A111E',
    mainBodyBackgroundRight: '#1A283E',
  },
  header: {
    backgroundImage: 'linear-gradient(to right, #0A111E, #1A283E)',
    boxShadow: 'none',
    height: '163px',
    color: '#37474F',
  },
  themeBreakPoints: {
    lg: '992px',
    md: '768px',
    sm: '480px',
    xl: '1024px',
    xs: '320px',
    xxl: '1280px',
    xxxl: '1366px',
  },
  paddings: {
    mainPadding: '15px',
  },
  mainContainer: {
    maxWidth: '586px',
  },
  textfield: {
      // Common
      height: '56px',
      width: '744px',
      borderRadius: '28px',
      fontFamily: 'Poppins',
      fontSize: '14px',
      fontWeight: '500',
      paddingHorizontal: '18px',
      paddingVertical: '1px',
      textAlign: 'left',
      backgroundColor: 'rgb(207,224,255, 0.1)',

      // Filled
      color: '#ffffff',

      // Placeholder
      placeholderColor: 'rgb(207,224,255,0.5)',

      // On Hover
      hoverBackgroundColor: 'rgb(171,201,255, 0.2)',
      hoverColor: 'rgb(207,224,255, 0.2)',

      // Focus
      focusColor: '#ffffff',

  },
    modalStyle: {
        content: {
            backgroundColor: '#243042',
            borderColor: 'none',
            borderRadius: '16px',
            borderStyle: 'none',
            borderWidth: 'none',
            bottom: 'auto',
            boxShadow: '0 16px 80px 0 rgba(0, 0, 0, 0.25',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: '0',
            height: 'fit-content',
            left: 'auto',
            margin: 'auto 0',
            overflow: 'hidden',
            padding: '40px 48px',
            position: 'relative',
            right: 'auto',
            top: 'auto',
            width: '408px',
        },
        overlay: {
            alignItems: 'unset',
            backgroundColor: 'rgb(7,11,17, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            overflow: 'auto',
            padding: '10px',
            zIndex: '12345',
        },
    },
}

export default theme
