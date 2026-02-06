export const fetchUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: {
      id,
    }
  });
}
