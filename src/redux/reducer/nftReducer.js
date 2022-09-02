const InitialState = {
  loading: false,
  error: "",
  success: false,
  nftList: [],
};

export const nftReducer = (state = InitialState, action) => {
  switch (action.type) {
    case "ACTION_START":
      return {
        ...state,
        success: false,
        error: "",
        loading: true,
      };
    case "FECHED_NFT":
      return {
        ...state,
        success: true,
        error: "",
        nftList: action.payload,
        loading: false,
      };
    case "FECHED_NFT_ERROR":
      return {
        ...state,
        success: false,
        error: "",
        nftList: [],
        loading: false,
      };
  }
};
