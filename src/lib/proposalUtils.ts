export const generateProposalId = (prefix: string, counterKey: string): string => {
  const now = new Date();
  const year = now.getFullYear().toString();

  // Get the next sequential number from localStorage or start at 1
  const nextProposalNumber = localStorage.getItem(counterKey)
    ? parseInt(localStorage.getItem(counterKey) || '1', 10)
    : 1;

  // Format the number with 4 digits
  const formattedNumber = nextProposalNumber.toString().padStart(4, '0');
  const proposalId = `${prefix}_${formattedNumber}/${year}`;

  // Update the counter for the next proposal
  localStorage.setItem(counterKey, (nextProposalNumber + 1).toString());

  return proposalId;
};
