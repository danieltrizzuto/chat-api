const NOT_VALID = 'N/D';

export const isDataValid = (data: StockDataResponse | undefined) => {
  if (!data) {
    return false;
  }

  const isSymbolValid = data.Symbol && data.Symbol !== NOT_VALID;

  const isCloseValid = data.Close && data.Close !== NOT_VALID;

  return isSymbolValid && isCloseValid;
};
