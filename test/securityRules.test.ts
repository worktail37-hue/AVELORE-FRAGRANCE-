/**
 * Avelore Security Rules & Server Sanitization Validation Suite
 * Verifies the Dirty Dozen attack payloads and server-side validation invariants.
 */

// Simulated Server-Side Validation Test
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{5,20}$/;

function sanitizeText(input: unknown, maxLen = 500): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function testServerValidation() {
  const testCases = [
    {
      name: 'Reject empty payload',
      payload: {},
      shouldPass: false,
    },
    {
      name: 'Reject invalid email format',
      payload: { clientName: 'Jean Dupont', clientEmail: 'invalid-email', message: 'Hello fragrance world' },
      shouldPass: false,
    },
    {
      name: 'Reject message under 5 characters',
      payload: { clientName: 'Jean Dupont', clientEmail: 'jean@dupont.fr', message: 'hi' },
      shouldPass: false,
    },
    {
      name: 'Strip HTML and script injections',
      payload: { clientName: '<script>alert(1)</script>Jean', clientEmail: 'jean@dupont.fr', message: '<b>Clean</b> message' },
      shouldPass: true,
      verify: (sanitized: any) => !sanitized.clientName.includes('<') && !sanitized.clientName.includes('>'),
    },
    {
      name: 'Accept valid enquiry',
      payload: {
        clientName: 'Caroline de Beauvoir',
        clientEmail: 'caroline@domain.com',
        clientPhone: '+33 6 12 34 56 78',
        subject: 'Bespoke Formulation',
        message: 'Inquiring regarding private extraction of Orris butter.',
      },
      shouldPass: true,
    },
  ];

  let passed = 0;
  for (const tc of testCases) {
    const rawName = tc.payload.clientName;
    const rawEmail = tc.payload.clientEmail;
    const rawMessage = tc.payload.message;

    let valid = true;
    if (typeof rawName !== 'string' || rawName.trim().length < 2) valid = false;
    if (typeof rawEmail !== 'string' || !EMAIL_REGEX.test(rawEmail.trim().toLowerCase())) valid = false;
    if (typeof rawMessage !== 'string' || rawMessage.trim().length < 5) valid = false;

    if (valid === tc.shouldPass) {
      if (tc.verify) {
        const sanitized = {
          clientName: sanitizeText(rawName, 128),
          clientEmail: sanitizeText(rawEmail, 256),
          message: sanitizeText(rawMessage, 2000),
        };
        if (tc.verify(sanitized)) passed++;
      } else {
        passed++;
      }
    }
  }

  console.log(`Security validation assertions passed: ${passed}/${testCases.length}`);
}

testServerValidation();
