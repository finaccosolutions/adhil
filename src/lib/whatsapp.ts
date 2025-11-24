const ADMIN_WHATSAPP = '918129464465';

interface TravelerInfo {
  name: string;
  phone: string;
  paidAdvance: boolean;
}

export const sendBookingToWhatsApp = (
  packageTitle: string,
  destination: string,
  contactName: string,
  contactPhone: string,
  travelers: TravelerInfo[],
  travelDate: string,
  numberOfPeople: number,
  totalAmount: number,
  advancePayment: number,
  remainingAmount: number,
  groupName?: string
) => {
  const paidTravelers = travelers.filter(t => t.paidAdvance);
  const unpaidTravelers = travelers.filter(t => !t.paidAdvance);

  const paidTravelersText = paidTravelers.length > 0
    ? paidTravelers.map((t, i) => `${i + 1}. ${t.name} - ${t.phone}`).join('%0A')
    : 'None';

  const unpaidTravelersText = unpaidTravelers.length > 0
    ? unpaidTravelers.map((t, i) => `${i + 1}. ${t.name} - ${t.phone}`).join('%0A')
    : 'None';

  const allTravelersText = travelers
    .map((t, i) => `${i + 1}. ${t.name} - ${t.phone}`)
    .join('%0A');

  const message = `*🎉 NEW BOOKING REQUEST 🎉*%0A%0A` +
    `📦 *Package:* ${packageTitle}%0A` +
    `📍 *Destination:* ${destination}%0A` +
    (groupName ? `👥 *Group Name:* ${groupName}%0A` : '') +
    `📅 *Travel Date:* ${travelDate}%0A` +
    `👤 *Total Travelers:* ${numberOfPeople}%0A%0A` +
    `*Contact Person:*%0A` +
    `Name: ${contactName}%0A` +
    `Phone: ${contactPhone}%0A%0A` +
    `*All Travelers:*%0A${allTravelersText}%0A%0A` +
    `*💰 Payment Details:*%0A` +
    `Total Amount: ₹${totalAmount.toLocaleString()}%0A` +
    `Advance Required: ₹${advancePayment.toLocaleString()}%0A` +
    `Remaining Balance: ₹${remainingAmount.toLocaleString()}%0A%0A` +
    `*✅ Paid Advance (${paidTravelers.length}/${numberOfPeople}):*%0A${paidTravelersText}%0A%0A` +
    `*⏳ Pending Advance (${unpaidTravelers.length}/${numberOfPeople}):*%0A${unpaidTravelersText}%0A%0A` +
    `Please confirm this booking! 🙏`;

  const url = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
  window.open(url, '_blank');
};

export const sendConfirmationToUser = (
  phone: string,
  packageTitle: string,
  bookingDate: string
) => {
  const cleanPhone = phone.replace(/\D/g, '');
  const message = `*Booking Confirmed!*%0A%0A` +
    `Your booking for ${packageTitle} on ${bookingDate} has been confirmed.%0A%0A` +
    `Thank you for choosing us! 🎉%0A%0A` +
    `For any queries:%0A` +
    `📞 +91 7592049934%0A` +
    `📞 +91 9495919934`;

  const url = `https://wa.me/91${cleanPhone}?text=${message}`;
  window.open(url, '_blank');
};
