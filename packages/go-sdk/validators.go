package blindfold

import (
	"regexp"
	"strconv"
	"strings"
	"unicode"
)

// ---- Utility functions ----

func extractDigits(s string) []int {
	var result []int
	for _, r := range s {
		if unicode.IsDigit(r) {
			result = append(result, int(r-'0'))
		}
	}
	return result
}

func extractDigitString(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func extractAlnum(s string) string {
	var b strings.Builder
	for _, r := range s {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			b.WriteRune(r)
		}
	}
	return b.String()
}

func isAllDigits(s string) bool {
	if len(s) == 0 {
		return false
	}
	for _, r := range s {
		if !unicode.IsDigit(r) {
			return false
		}
	}
	return true
}

func padLeft(digitStr string, length int) []int {
	result := make([]int, length)
	offset := length - len(digitStr)
	for i := 0; i < len(digitStr); i++ {
		result[offset+i] = int(digitStr[i] - '0')
	}
	return result
}

// ---- Luhn ----

func luhnChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) < 2 {
		return false
	}
	total := 0
	for i, pos := len(digits)-1, 0; i >= 0; i, pos = i-1, pos+1 {
		d := digits[i]
		if pos%2 == 1 {
			d *= 2
			if d > 9 {
				d -= 9
			}
		}
		total += d
	}
	return total%10 == 0
}

// ---- IBAN mod-97 ----

func ibanMod97(iban string) bool {
	cleaned := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(iban, " ", ""), "-", ""))
	if len(cleaned) < 5 {
		return false
	}
	if !unicode.IsLetter(rune(cleaned[0])) || !unicode.IsLetter(rune(cleaned[1])) {
		return false
	}
	if !unicode.IsDigit(rune(cleaned[2])) || !unicode.IsDigit(rune(cleaned[3])) {
		return false
	}
	rearranged := cleaned[4:] + cleaned[:4]
	var numeric strings.Builder
	for _, c := range rearranged {
		if unicode.IsDigit(c) {
			numeric.WriteRune(c)
		} else if unicode.IsLetter(c) {
			numeric.WriteString(strconv.Itoa(int(c-'A') + 10))
		} else {
			return false
		}
	}
	// Process in chunks
	numStr := numeric.String()
	remainder := int64(0)
	for _, c := range numStr {
		remainder = (remainder*10 + int64(c-'0')) % 97
	}
	return remainder == 1
}

// ---- SSN ----

func ssnValidFormat(ssn string) bool {
	digits := extractDigitString(ssn)
	if len(digits) != 9 {
		return false
	}
	area, _ := strconv.Atoi(digits[:3])
	group, _ := strconv.Atoi(digits[3:5])
	serial, _ := strconv.Atoi(digits[5:])
	return area != 0 && area != 666 && area < 900 && group != 0 && serial != 0
}

// ---- German Tax ID (ISO 7064 Mod 11,10) ----

func deTaxIdChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	product := 10
	for i := 0; i < 10; i++ {
		total := (digits[i] + product) % 10
		if total == 0 {
			total = 10
		}
		product = (total * 2) % 11
	}
	check := 11 - product
	if check == 10 {
		check = 0
	}
	return digits[10] == check
}

// ---- French NIR (mod 97) ----

func frNirChecksum(number string) bool {
	upper := strings.ToUpper(number)
	upper = strings.ReplaceAll(upper, "2A", "19")
	upper = strings.ReplaceAll(upper, "2B", "18")
	cleaned := extractDigitString(upper)
	if len(cleaned) != 15 {
		return false
	}
	base, err := strconv.ParseInt(cleaned[:13], 10, 64)
	if err != nil {
		return false
	}
	key, err := strconv.Atoi(cleaned[13:15])
	if err != nil {
		return false
	}
	return key == int(97-(base%97))
}

// ---- Spanish DNI ----

const esDNILetters = "TRWAGMYFPDXBNJZSQVHLCKE"

func esDniLetter(number string) bool {
	cleaned := strings.ToUpper(extractAlnum(number))
	if len(cleaned) != 9 {
		return false
	}
	digitsStr := cleaned[:8]
	letter := cleaned[8]
	if !isAllDigits(digitsStr) {
		return false
	}
	num, _ := strconv.Atoi(digitsStr)
	expected := esDNILetters[num%23]
	return letter == expected
}

// ---- Spanish NIE ----

func esNieLetter(number string) bool {
	cleaned := strings.ToUpper(extractAlnum(number))
	if len(cleaned) != 9 {
		return false
	}
	prefix := cleaned[0]
	var mapping string
	switch prefix {
	case 'X':
		mapping = "0"
	case 'Y':
		mapping = "1"
	case 'Z':
		mapping = "2"
	default:
		return false
	}
	digitsStr := mapping + cleaned[1:8]
	letter := cleaned[8]
	if !isAllDigits(digitsStr) {
		return false
	}
	num, _ := strconv.Atoi(digitsStr)
	expected := esDNILetters[num%23]
	return letter == expected
}

// ---- Italian Codice Fiscale ----

var itOdd [128]int
var itEven [128]int

func init() {
	oddVals := []int{1, 0, 5, 7, 9, 13, 15, 17, 19, 21, 1, 0, 5, 7, 9, 13, 15, 17, 19, 21,
		2, 4, 18, 20, 11, 3, 6, 8, 12, 14, 16, 10, 22, 25, 24, 23}
	oddKeys := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	for i := 0; i < len(oddKeys); i++ {
		itOdd[oddKeys[i]] = oddVals[i]
	}
	evenKeys := "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	for i := 0; i < len(evenKeys); i++ {
		if i < 10 {
			itEven[evenKeys[i]] = i
		} else {
			itEven[evenKeys[i]] = i - 10
		}
	}
}

func itCodiceFiscaleCheck(code string) bool {
	cleaned := strings.ToUpper(extractAlnum(code))
	if len(cleaned) != 16 {
		return false
	}
	total := 0
	for i := 0; i < 15; i++ {
		c := cleaned[i]
		if c >= 128 {
			return false
		}
		if (i+1)%2 == 1 {
			total += itOdd[c]
		} else {
			total += itEven[c]
		}
	}
	expected := byte(total%26 + 'A')
	return cleaned[15] == expected
}

// ---- Portuguese NIF ----

func ptNifChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 9 {
		return false
	}
	first := digits[0]
	if first != 1 && first != 2 && first != 3 && first != 5 && first != 6 && first != 8 && first != 9 {
		return false
	}
	total := 0
	for i := 0; i < 8; i++ {
		total += digits[i] * (9 - i)
	}
	remainder := total % 11
	check := 0
	if remainder >= 2 {
		check = 11 - remainder
	}
	return digits[8] == check
}

// ---- Polish PESEL ----

func plPeselChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	weights := []int{1, 3, 7, 9, 1, 3, 7, 9, 1, 3}
	total := 0
	for i := 0; i < 10; i++ {
		total += digits[i] * weights[i]
	}
	check := (10 - (total % 10)) % 10
	return digits[10] == check
}

// ---- Polish NIP ----

func plNipChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	weights := []int{6, 5, 7, 2, 3, 4, 5, 6, 7}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i] * weights[i]
	}
	check := total % 11
	if check == 10 {
		return false
	}
	return digits[9] == check
}

// ---- Polish REGON ----

func plRegonChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) == 9 {
		weights := []int{8, 9, 2, 3, 4, 5, 6, 7}
		total := 0
		for i := 0; i < 8; i++ {
			total += digits[i] * weights[i]
		}
		check := total % 11
		if check == 10 {
			check = 0
		}
		return digits[8] == check
	}
	if len(digits) == 14 {
		w9 := []int{8, 9, 2, 3, 4, 5, 6, 7}
		t9 := 0
		for i := 0; i < 8; i++ {
			t9 += digits[i] * w9[i]
		}
		c9 := t9 % 11
		if c9 == 10 {
			c9 = 0
		}
		if digits[8] != c9 {
			return false
		}
		w14 := []int{2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8}
		t14 := 0
		for i := 0; i < 13; i++ {
			t14 += digits[i] * w14[i]
		}
		c14 := t14 % 11
		if c14 == 10 {
			c14 = 0
		}
		return digits[13] == c14
	}
	return false
}

// ---- Czech Birth Number ----

func czBirthNumberValid(number string) bool {
	cleaned := strings.ReplaceAll(strings.ReplaceAll(number, "/", ""), " ", "")
	if !isAllDigits(cleaned) {
		return false
	}
	if len(cleaned) != 9 && len(cleaned) != 10 {
		return false
	}
	if len(cleaned) == 10 {
		n, err := strconv.ParseInt(cleaned, 10, 64)
		if err != nil || n%11 != 0 {
			return false
		}
	}
	month, _ := strconv.Atoi(cleaned[2:4])
	baseMonth := month % 50
	if baseMonth > 20 {
		baseMonth -= 20
	}
	return baseMonth >= 1 && baseMonth <= 12
}

// ---- Czech ICO ----

func czIcoChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 8 {
		return false
	}
	weights := []int{8, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 7; i++ {
		total += digits[i] * weights[i]
	}
	remainder := total % 11
	var check int
	if remainder == 0 {
		check = 1
	} else if remainder == 1 {
		check = 0
	} else {
		check = 11 - remainder
	}
	return digits[7] == check
}

// ---- Czech DIC ----

func czDicValid(number string) bool {
	cleaned := strings.TrimSpace(number)
	if strings.HasPrefix(strings.ToUpper(cleaned), "CZ") {
		cleaned = cleaned[2:]
	}
	if !isAllDigits(cleaned) {
		return false
	}
	if len(cleaned) == 8 {
		return czIcoChecksum(cleaned)
	}
	if len(cleaned) == 10 {
		n, err := strconv.ParseInt(cleaned, 10, 64)
		return err == nil && n%11 == 0
	}
	if len(cleaned) == 9 {
		month, _ := strconv.Atoi(cleaned[2:4])
		baseMonth := month % 50
		if baseMonth > 20 {
			baseMonth -= 20
		}
		return baseMonth >= 1 && baseMonth <= 12
	}
	return false
}

// ---- Czech Bank Account ----

func czBankAccountValid(number string) bool {
	parts := strings.Split(number, "/")
	if len(parts) != 2 {
		return false
	}
	bankCode := parts[1]
	if !isAllDigits(bankCode) || len(bankCode) != 4 {
		return false
	}
	accountPart := parts[0]
	prefix := ""
	account := accountPart
	if strings.Contains(accountPart, "-") {
		split := strings.SplitN(accountPart, "-", 2)
		if len(split) != 2 {
			return false
		}
		prefix = split[0]
		account = split[1]
	}
	if prefix != "" && (!isAllDigits(prefix) || len(prefix) > 6) {
		return false
	}
	if !isAllDigits(account) || len(account) < 2 || len(account) > 10 {
		return false
	}
	weights := []int{6, 3, 7, 9, 10, 5, 8, 4, 2, 1}
	accDigits := padLeft(account, 10)
	total := 0
	for i := 0; i < 10; i++ {
		total += accDigits[i] * weights[i]
	}
	if total%11 != 0 {
		return false
	}
	if prefix != "" {
		prefDigits := padLeft(prefix, 6)
		prefWeights := []int{10, 5, 8, 4, 2, 1}
		prefTotal := 0
		for i := 0; i < 6; i++ {
			prefTotal += prefDigits[i] * prefWeights[i]
		}
		if prefTotal%11 != 0 {
			return false
		}
	}
	if prefix == "" && len(account) == 6 && czBirthNumberValid(number) {
		return false
	}
	return true
}

// ---- Slovak Birth Number ----

func skBirthNumberValid(number string) bool {
	return czBirthNumberValid(number)
}

// ---- Slovak ICO ----

func skIcoChecksum(number string) bool {
	return czIcoChecksum(number)
}

// ---- Slovak DIC ----

func skDicValid(number string) bool {
	cleaned := strings.TrimSpace(number)
	if strings.HasPrefix(strings.ToUpper(cleaned), "SK") {
		cleaned = cleaned[2:]
	}
	if !isAllDigits(cleaned) || len(cleaned) != 10 {
		return false
	}
	n, err := strconv.ParseInt(cleaned, 10, 64)
	return err == nil && n%11 == 0
}

// ---- Russian INN ----

func ruInnChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) == 10 {
		weights := []int{2, 4, 10, 3, 5, 9, 4, 6, 8}
		total := 0
		for i := 0; i < 9; i++ {
			total += digits[i] * weights[i]
		}
		return digits[9] == (total%11)%10
	}
	if len(digits) == 12 {
		w1 := []int{7, 2, 4, 10, 3, 5, 9, 4, 6, 8}
		t1 := 0
		for i := 0; i < 10; i++ {
			t1 += digits[i] * w1[i]
		}
		if digits[10] != (t1%11)%10 {
			return false
		}
		w2 := []int{3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8}
		t2 := 0
		for i := 0; i < 11; i++ {
			t2 += digits[i] * w2[i]
		}
		return digits[11] == (t2%11)%10
	}
	return false
}

// ---- Russian SNILS ----

func ruSnilsChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	base := int64(0)
	for i := 0; i < 9; i++ {
		base = base*10 + int64(digits[i])
	}
	if base <= 1001998 {
		return true
	}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i] * (9 - i)
	}
	check := total % 101
	if check == 100 {
		check = 0
	}
	checkValue := digits[9]*10 + digits[10]
	return checkValue == check
}

// ---- Dutch BSN (11-test) ----

func nlBsn11Test(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 9 {
		return false
	}
	total := 0
	for i := 0; i < 8; i++ {
		total += digits[i] * (9 - i)
	}
	total -= digits[8]
	return total%11 == 0 && total != 0
}

// ---- Romanian CNP ----

func roCnpChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 13 {
		return false
	}
	if digits[0] < 1 || digits[0] > 8 {
		return false
	}
	weights := []int{2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9}
	total := 0
	for i := 0; i < 12; i++ {
		total += digits[i] * weights[i]
	}
	check := total % 11
	if check == 10 {
		check = 1
	}
	return digits[12] == check
}

// ---- Romanian CUI ----

func roCuiChecksum(number string) bool {
	cleaned := strings.TrimSpace(strings.ToUpper(number))
	if strings.HasPrefix(cleaned, "RO") {
		cleaned = cleaned[2:]
	}
	digits := extractDigits(cleaned)
	if len(digits) < 2 || len(digits) > 10 {
		return false
	}
	weights := []int{7, 5, 3, 2, 1, 7, 5, 3, 2}
	padded := make([]int, 10)
	offset := 10 - len(digits)
	copy(padded[offset:], digits)
	check := padded[9]
	total := 0
	for i := 0; i < 9; i++ {
		total += padded[i] * weights[i]
	}
	expected := (total * 10) % 11
	if expected == 10 {
		expected = 0
	}
	return check == expected
}

// ---- Danish CPR valid date ----

func dkCprValidDate(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 10 {
		return false
	}
	day, _ := strconv.Atoi(digits[:2])
	month, _ := strconv.Atoi(digits[2:4])
	return day >= 1 && day <= 31 && month >= 1 && month <= 12
}

// ---- Danish CVR ----

func dkCvrChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 8 {
		return false
	}
	weights := []int{2, 7, 6, 5, 4, 3, 2, 1}
	total := 0
	for i := 0; i < 8; i++ {
		total += digits[i] * weights[i]
	}
	return total%11 == 0
}

// ---- Swedish Personnummer (Luhn on last 10) ----

func sePersonnummerLuhn(number string) bool {
	digits := extractDigitString(number)
	if len(digits) == 12 {
		digits = digits[2:]
	}
	if len(digits) != 10 {
		return false
	}
	month, _ := strconv.Atoi(digits[2:4])
	day, _ := strconv.Atoi(digits[4:6])
	if month < 1 || month > 12 || day < 1 || day > 31 {
		return false
	}
	return luhnChecksum(digits)
}

// ---- Swedish Organisationsnummer ----

func seOrgnrChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 10 {
		return false
	}
	if int(digits[2]-'0') < 2 {
		return false
	}
	return luhnChecksum(digits)
}

// ---- Norwegian Birth Number ----

func noBirthNumberChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	w1 := []int{3, 7, 6, 1, 8, 9, 4, 5, 2}
	t1 := 0
	for i := 0; i < 9; i++ {
		t1 += digits[i] * w1[i]
	}
	c1 := 11 - (t1 % 11)
	if c1 == 11 {
		c1 = 0
	}
	if c1 == 10 {
		return false
	}
	if digits[9] != c1 {
		return false
	}
	w2 := []int{5, 4, 3, 2, 7, 6, 5, 4, 3, 2}
	t2 := 0
	for i := 0; i < 10; i++ {
		t2 += digits[i] * w2[i]
	}
	c2 := 11 - (t2 % 11)
	if c2 == 11 {
		c2 = 0
	}
	if c2 == 10 {
		return false
	}
	return digits[10] == c2
}

// ---- Norwegian Organisasjonsnummer ----

func noOrgnrChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 9 {
		return false
	}
	weights := []int{3, 2, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 8; i++ {
		total += digits[i] * weights[i]
	}
	remainder := total % 11
	if remainder == 1 {
		return false
	}
	check := 0
	if remainder != 0 {
		check = 11 - remainder
	}
	return digits[8] == check
}

// ---- Belgian National Number ----

func beNationalNumberChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 11 {
		return false
	}
	base, _ := strconv.ParseInt(digits[:9], 10, 64)
	check, _ := strconv.Atoi(digits[9:11])
	if 97-(base%97) == int64(check) {
		return true
	}
	base2000, _ := strconv.ParseInt("2"+digits[:9], 10, 64)
	return 97-(base2000%97) == int64(check)
}

// ---- Belgian Enterprise Number ----

func beEnterpriseChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 10 {
		return false
	}
	if digits[0] != '0' && digits[0] != '1' {
		return false
	}
	base, _ := strconv.ParseInt(digits[:8], 10, 64)
	check, _ := strconv.Atoi(digits[8:10])
	return 97-(base%97) == int64(check)
}

// ---- Austrian SVNR ----

func atSvnrChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	weights := []int{3, 7, 9, 0, 5, 8, 4, 2, 1, 6}
	total := 0
	for i := 0; i < 10; i++ {
		total += digits[i] * weights[i]
	}
	return total%11 == digits[3]
}

// ---- Irish PPS ----

func iePpsChecksum(number string) bool {
	cleaned := strings.ToUpper(extractAlnum(number))
	if len(cleaned) != 8 && len(cleaned) != 9 {
		return false
	}
	total := 0
	for i := 0; i < 7; i++ {
		if !unicode.IsDigit(rune(cleaned[i])) {
			return false
		}
		total += int(cleaned[i]-'0') * (8 - i)
	}
	if len(cleaned) == 9 && unicode.IsLetter(rune(cleaned[8])) {
		total += (int(cleaned[8]-'A') + 1) * 9
	}
	remainder := total % 23
	var expected byte
	if remainder == 0 {
		expected = 'W'
	} else {
		expected = byte('A' + remainder - 1)
	}
	return cleaned[7] == expected
}

// ---- Finnish HETU ----

func fiHetuChecksum(number string) bool {
	cleaned := strings.ReplaceAll(strings.ReplaceAll(number, " ", ""), "-", "")
	if len(cleaned) != 11 {
		cleaned = strings.TrimSpace(number)
	}
	if len(cleaned) != 11 {
		return false
	}
	datePart := cleaned[:6]
	if !isAllDigits(datePart) {
		return false
	}
	sep := cleaned[6]
	if !strings.ContainsRune("-+ABCDEFYXWVUabcdefyxwvu", rune(sep)) {
		return false
	}
	numPart := cleaned[7:10]
	if !isAllDigits(numPart) {
		return false
	}
	checkChars := "0123456789ABCDEFHJKLMNPRSTUVWXY"
	combined, _ := strconv.Atoi(datePart + numPart)
	expected := checkChars[combined%31]
	return strings.ToUpper(string(cleaned[10]))[0] == expected
}

// ---- Finnish Y-tunnus ----

func fiYtunnusChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 8 {
		return false
	}
	weights := []int{7, 9, 10, 5, 8, 4, 2}
	total := 0
	for i := 0; i < 7; i++ {
		total += int(digits[i]-'0') * weights[i]
	}
	remainder := total % 11
	if remainder == 1 {
		return false
	}
	check := 0
	if remainder != 0 {
		check = 11 - remainder
	}
	return int(digits[7]-'0') == check
}

// ---- Hungarian Tax ID ----

func huTaxIdChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	if digits[0] != 8 {
		return false
	}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i] * (i + 1)
	}
	return digits[9] == total%11
}

// ---- Hungarian TAJ ----

func huTajChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 9 {
		return false
	}
	total := 0
	for i := 0; i < 8; i++ {
		if i%2 == 0 {
			total += digits[i] * 3
		} else {
			total += digits[i] * 7
		}
	}
	return digits[8] == total%10
}

// ---- Bulgarian EGN ----

func bgEgnChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	raw := extractDigitString(number)
	month, _ := strconv.Atoi(raw[2:4])
	baseMonth := month
	if baseMonth > 40 {
		baseMonth -= 40
	} else if baseMonth > 20 {
		baseMonth -= 20
	}
	if baseMonth < 1 || baseMonth > 12 {
		return false
	}
	weights := []int{2, 4, 8, 5, 10, 9, 7, 3, 6}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i] * weights[i]
	}
	check := total % 11
	if check == 10 {
		check = 0
	}
	return digits[9] == check
}

// ---- Croatian OIB (ISO 7064 MOD 11,2) ----

func hrOibChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	remainder := 10
	for i := 0; i < 10; i++ {
		remainder = (remainder + digits[i]) % 10
		if remainder == 0 {
			remainder = 10
		}
		remainder = (remainder * 2) % 11
	}
	check := 11 - remainder
	if check == 10 {
		check = 0
	}
	return digits[10] == check
}

// ---- Slovenian EMSO ----

func siEmsoChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 13 {
		return false
	}
	weights := []int{7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 12; i++ {
		total += digits[i] * weights[i]
	}
	remainder := total % 11
	check := 0
	if remainder != 0 {
		check = 11 - remainder
	}
	if check == 10 {
		return false
	}
	return digits[12] == check
}

// ---- Slovenian Tax Number ----

func siTaxNumberChecksum(number string) bool {
	cleaned := strings.TrimSpace(strings.ToUpper(number))
	if strings.HasPrefix(cleaned, "SI") {
		cleaned = cleaned[2:]
	}
	digits := extractDigits(cleaned)
	if len(digits) != 8 {
		return false
	}
	weights := []int{8, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 7; i++ {
		total += digits[i] * weights[i]
	}
	remainder := total % 11
	if remainder == 0 || remainder == 1 {
		return digits[7] == 0
	}
	return digits[7] == 11-remainder
}

// ---- Lithuanian Personal Code ----

func ltPersonalCodeChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	if digits[0] < 1 || digits[0] > 6 {
		return false
	}
	w1 := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 1}
	total := 0
	for i := 0; i < 10; i++ {
		total += digits[i] * w1[i]
	}
	check := total % 11
	if check == 10 {
		w2 := []int{3, 4, 5, 6, 7, 8, 9, 1, 2, 3}
		total = 0
		for i := 0; i < 10; i++ {
			total += digits[i] * w2[i]
		}
		check = total % 11
		if check == 10 {
			check = 0
		}
	}
	return digits[10] == check
}

// ---- Latvian Personal Code ----

func lvPersonalCodeChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 11 {
		return false
	}
	day, _ := strconv.Atoi(digits[:2])
	month, _ := strconv.Atoi(digits[2:4])
	// New format (32xxxx...)
	if digits[0] == '3' && digits[1] == '2' {
		return true
	}
	if day < 1 || day > 31 || month < 1 || month > 12 {
		return false
	}
	weights := []int{1, 6, 3, 7, 9, 10, 5, 8, 4, 2}
	total := 0
	for i := 0; i < 10; i++ {
		total += int(digits[i]-'0') * weights[i]
	}
	check := ((1101 - total) % 11) % 10
	return int(digits[10]-'0') == check
}

// ---- Estonian Personal Code ----

func eePersonalCodeChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	if digits[0] < 1 || digits[0] > 6 {
		return false
	}
	w1 := []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 1}
	total := 0
	for i := 0; i < 10; i++ {
		total += digits[i] * w1[i]
	}
	check := total % 11
	if check == 10 {
		w2 := []int{3, 4, 5, 6, 7, 8, 9, 1, 2, 3}
		total = 0
		for i := 0; i < 10; i++ {
			total += digits[i] * w2[i]
		}
		check = total % 11
		if check == 10 {
			check = 0
		}
	}
	return digits[10] == check
}

// ---- Swiss AHV (EAN-13) ----

func chAhvChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 13 || !strings.HasPrefix(digits, "756") {
		return false
	}
	total := 0
	for i := 0; i < 12; i++ {
		w := 1
		if i%2 != 0 {
			w = 3
		}
		total += int(digits[i]-'0') * w
	}
	check := (10 - (total % 10)) % 10
	return int(digits[12]-'0') == check
}

// ---- Australian TFN ----

func auTfnChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) == 8 {
		weights := []int{10, 7, 8, 4, 6, 3, 5, 1}
		total := 0
		for i := 0; i < 8; i++ {
			total += digits[i] * weights[i]
		}
		return total%11 == 0
	}
	if len(digits) == 9 {
		weights := []int{1, 4, 3, 7, 5, 8, 6, 9, 10}
		total := 0
		for i := 0; i < 9; i++ {
			total += digits[i] * weights[i]
		}
		return total%11 == 0
	}
	return false
}

// ---- Australian Medicare ----

func auMedicareChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) < 10 || len(digits) > 11 {
		return false
	}
	weights := []int{1, 3, 7, 9, 1, 3, 7, 9}
	total := 0
	for i := 0; i < 8; i++ {
		total += int(digits[i]-'0') * weights[i]
	}
	return int(digits[8]-'0') == total%10
}

// ---- New Zealand IRD ----

func nzIrdChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 8 && len(digits) != 9 {
		return false
	}
	if len(digits) == 8 {
		digits = "0" + digits
	}
	d := make([]int, 9)
	for i := 0; i < 9; i++ {
		d[i] = int(digits[i] - '0')
	}
	w1 := []int{3, 2, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 8; i++ {
		total += d[i] * w1[i]
	}
	r := total % 11
	if r == 0 {
		return d[8] == 0
	}
	if 11-r != 10 {
		return d[8] == 11-r
	}
	w2 := []int{7, 4, 3, 2, 5, 2, 7, 6}
	total = 0
	for i := 0; i < 8; i++ {
		total += d[i] * w2[i]
	}
	r2 := total % 11
	if r2 == 0 {
		return d[8] == 0
	}
	return d[8] == 11-r2
}

// ---- Indian Aadhaar (Verhoeff) ----

var verhoeffD = [10][10]int{
	{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}, {1, 2, 3, 4, 0, 6, 7, 8, 9, 5},
	{2, 3, 4, 0, 1, 7, 8, 9, 5, 6}, {3, 4, 0, 1, 2, 8, 9, 5, 6, 7},
	{4, 0, 1, 2, 3, 9, 5, 6, 7, 8}, {5, 9, 8, 7, 6, 0, 4, 3, 2, 1},
	{6, 5, 9, 8, 7, 1, 0, 4, 3, 2}, {7, 6, 5, 9, 8, 2, 1, 0, 4, 3},
	{8, 7, 6, 5, 9, 3, 2, 1, 0, 4}, {9, 8, 7, 6, 5, 4, 3, 2, 1, 0},
}
var verhoeffP = [8][10]int{
	{0, 1, 2, 3, 4, 5, 6, 7, 8, 9}, {1, 5, 7, 6, 2, 8, 3, 0, 9, 4},
	{5, 8, 0, 3, 7, 9, 6, 1, 4, 2}, {8, 9, 1, 6, 0, 4, 3, 5, 2, 7},
	{9, 4, 5, 3, 1, 2, 6, 8, 7, 0}, {4, 2, 8, 6, 5, 7, 3, 9, 0, 1},
	{2, 7, 9, 3, 8, 0, 6, 4, 1, 5}, {7, 0, 4, 6, 9, 1, 3, 2, 5, 8},
}

func inAadhaarChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 12 || digits[0] == '0' || digits[0] == '1' {
		return false
	}
	c := 0
	for i := len(digits) - 1; i >= 0; i-- {
		c = verhoeffD[c][verhoeffP[(len(digits)-1-i)%8][int(digits[i]-'0')]]
	}
	return c == 0
}

// ---- Indian PAN ----

var inPanRe = regexp.MustCompile(`^[A-Z]{3}[ABCFGHLJPT][A-Z]\d{4}[A-Z]$`)

func inPanValid(number string) bool {
	cleaned := strings.TrimSpace(strings.ToUpper(number))
	return len(cleaned) == 10 && inPanRe.MatchString(cleaned)
}

// ---- Japanese My Number ----

func jpMyNumberChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 12 {
		return false
	}
	total := 0
	for i := 0; i < 11; i++ {
		p := 11 - i
		q := p
		if q <= 6 {
			q = p + 1
		} else {
			q = p - 5
		}
		total += int(digits[i]-'0') * q
	}
	remainder := total % 11
	check := 0
	if remainder > 1 {
		check = 11 - remainder
	}
	return int(digits[11]-'0') == check
}

// ---- Korean RRN ----

func krRrnChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 13 {
		return false
	}
	weights := []int{2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5}
	total := 0
	for i := 0; i < 12; i++ {
		total += int(digits[i]-'0') * weights[i]
	}
	check := (11 - (total % 11)) % 10
	return int(digits[12]-'0') == check
}

// ---- Turkish Kimlik ----

func trKimlikChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 || digits[0] == 0 {
		return false
	}
	oddSum := digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
	evenSum := digits[1] + digits[3] + digits[5] + digits[7]
	check1 := ((oddSum * 7) - evenSum) % 10
	if check1 < 0 {
		check1 += 10
	}
	if check1 != digits[9] {
		return false
	}
	total := 0
	for i := 0; i < 10; i++ {
		total += digits[i]
	}
	return total%10 == digits[10]
}

// ---- Argentine CUIT ----

func arCuitChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 11 {
		return false
	}
	weights := []int{5, 4, 3, 2, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 10; i++ {
		total += int(digits[i]-'0') * weights[i]
	}
	remainder := total % 11
	var check int
	if remainder == 0 {
		check = 0
	} else if remainder == 1 {
		check = 9
	} else {
		check = 11 - remainder
	}
	return int(digits[10]-'0') == check
}

// ---- Chilean RUT ----

func clRutChecksum(number string) bool {
	cleaned := strings.ToUpper(strings.ReplaceAll(strings.ReplaceAll(number, ".", ""), " ", ""))
	if strings.Contains(cleaned, "-") {
		parts := strings.Split(cleaned, "-")
		if len(parts) != 2 {
			return false
		}
		cleaned = parts[0] + parts[1]
	}
	if len(cleaned) < 2 {
		return false
	}
	body := cleaned[:len(cleaned)-1]
	checkChar := cleaned[len(cleaned)-1]
	if !isAllDigits(body) {
		return false
	}
	total := 0
	mul := 2
	for i := len(body) - 1; i >= 0; i-- {
		total += int(body[i]-'0') * mul
		if mul == 7 {
			mul = 2
		} else {
			mul++
		}
	}
	remainder := 11 - (total % 11)
	var expected byte
	if remainder == 11 {
		expected = '0'
	} else if remainder == 10 {
		expected = 'K'
	} else {
		expected = byte('0' + remainder)
	}
	return checkChar == expected
}

// ---- Colombian NIT ----

func coNitChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) < 8 || len(digits) > 10 {
		return false
	}
	body := digits[:len(digits)-1]
	check := int(digits[len(digits)-1] - '0')
	weights := []int{3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71}
	total := 0
	for i := 0; i < len(body); i++ {
		total += int(body[len(body)-1-i]-'0') * weights[i]
	}
	remainder := total % 11
	var expected int
	if remainder == 0 {
		expected = 0
	} else if remainder == 1 {
		expected = 1
	} else {
		expected = 11 - remainder
	}
	return check == expected
}

// ---- Brazilian CPF ----

func brCpfChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	unique := make(map[int]bool)
	for _, d := range digits {
		unique[d] = true
	}
	if len(unique) == 1 {
		return false
	}
	t1 := 0
	for i := 0; i < 9; i++ {
		t1 += digits[i] * (10 - i)
	}
	c1 := (t1 * 10) % 11
	if c1 == 10 {
		c1 = 0
	}
	if digits[9] != c1 {
		return false
	}
	t2 := 0
	for i := 0; i < 10; i++ {
		t2 += digits[i] * (11 - i)
	}
	c2 := (t2 * 10) % 11
	if c2 == 10 {
		c2 = 0
	}
	return digits[10] == c2
}

// ---- Brazilian CNPJ ----

func brCnpjChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 14 {
		return false
	}
	w1 := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	t1 := 0
	for i := 0; i < 12; i++ {
		t1 += digits[i] * w1[i]
	}
	c1 := t1 % 11
	if c1 < 2 {
		c1 = 0
	} else {
		c1 = 11 - c1
	}
	if digits[12] != c1 {
		return false
	}
	w2 := []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	t2 := 0
	for i := 0; i < 13; i++ {
		t2 += digits[i] * w2[i]
	}
	c2 := t2 % 11
	if c2 < 2 {
		c2 = 0
	} else {
		c2 = 11 - c2
	}
	return digits[13] == c2
}

// ---- US ITIN ----

func usItinValid(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 9 || digits[0] != '9' {
		return false
	}
	return int(digits[3]-'0') >= 7
}

// ---- UK UTR ----

func ukUtrChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	weights := []int{6, 7, 8, 9, 10, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i+1] * weights[i]
	}
	remainder := total % 11
	check := 11 - remainder
	if check >= 10 {
		check = 0
	}
	return digits[0] == check
}

// ---- NHS ----

func nhsChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 10 {
		return false
	}
	weights := []int{10, 9, 8, 7, 6, 5, 4, 3, 2}
	total := 0
	for i := 0; i < 9; i++ {
		total += digits[i] * weights[i]
	}
	remainder := total % 11
	check := 11 - remainder
	if check == 11 {
		check = 0
	}
	if check == 10 {
		return false
	}
	return digits[9] == check
}

// ---- Spanish NSS ----

func esNssChecksum(number string) bool {
	digits := extractDigitString(number)
	if len(digits) != 12 {
		return false
	}
	province, _ := strconv.Atoi(digits[:2])
	if province < 1 || province > 53 {
		return false
	}
	baseNum, _ := strconv.ParseInt(digits[:10], 10, 64)
	check, _ := strconv.Atoi(digits[10:12])
	return int(baseNum%97) == check
}

// ---- Spanish CIF ----

func esCifChecksum(number string) bool {
	cleaned := strings.ToUpper(extractAlnum(number))
	if len(cleaned) != 9 {
		return false
	}
	letter := cleaned[0]
	if !strings.ContainsRune("ABCDEFGHJNPQRSUVW", rune(letter)) {
		return false
	}
	totalEven, totalOdd := 0, 0
	for i := 1; i <= 7; i++ {
		if !unicode.IsDigit(rune(cleaned[i])) {
			return false
		}
		d := int(cleaned[i] - '0')
		if i%2 == 0 {
			totalEven += d
		} else {
			doubled := d * 2
			totalOdd += doubled/10 + doubled%10
		}
	}
	total := totalEven + totalOdd
	checkDigit := (10 - (total % 10)) % 10
	control := cleaned[8]
	if strings.ContainsRune("KPQS", rune(letter)) {
		return control == byte('A'+checkDigit)
	}
	if strings.ContainsRune("ABEH", rune(letter)) {
		return control == byte('0'+checkDigit)
	}
	return control == byte('0'+checkDigit) || control == byte('A'+checkDigit)
}

// ---- Italian Partita IVA ----

func itPartitaIvaChecksum(number string) bool {
	digits := extractDigits(number)
	if len(digits) != 11 {
		return false
	}
	allZero := true
	for _, d := range digits {
		if d != 0 {
			allZero = false
			break
		}
	}
	if allZero {
		return false
	}
	total := 0
	for i := 0; i < 10; i++ {
		if i%2 == 0 {
			total += digits[i]
		} else {
			doubled := digits[i] * 2
			if doubled > 9 {
				doubled -= 9
			}
			total += doubled
		}
	}
	check := (10 - (total % 10)) % 10
	return digits[10] == check
}

// ---- Phone length check ----

var phoneDate = regexp.MustCompile(`\d{1,2}[-./]\d{1,2}[-./]\d{2,4}`)
var phoneSsn = regexp.MustCompile(`\d{3}[-\.]\d{2}[-\.]\d{4}`)

func phoneLengthCheck(number string) bool {
	digits := extractDigitString(number)
	if len(digits) < 7 || len(digits) > 15 {
		return false
	}
	if phoneDate.MatchString(number) {
		return false
	}
	if phoneSsn.MatchString(number) {
		return false
	}
	return true
}

// ---- URL TLD validation ----

var validTLDs = map[string]bool{
	"com": true, "org": true, "net": true, "edu": true, "gov": true, "mil": true, "int": true,
	"co": true, "io": true, "dev": true, "app": true, "ai": true, "me": true, "us": true,
	"uk": true, "ca": true, "au": true, "de": true, "fr": true, "es": true, "it": true,
	"nl": true, "be": true, "at": true, "ch": true, "ru": true, "cn": true, "jp": true,
	"kr": true, "in": true, "br": true, "mx": true, "ar": true, "za": true, "nz": true,
	"se": true, "no": true, "dk": true, "fi": true, "pl": true, "cz": true, "sk": true,
	"hu": true, "ro": true, "bg": true, "hr": true, "si": true, "lt": true, "lv": true,
	"ee": true, "ie": true, "pt": true, "il": true, "tr": true, "info": true, "biz": true,
	"name": true, "museum": true, "travel": true, "aero": true, "coop": true, "pro": true,
	"jobs": true, "tel": true, "mobi": true, "asia": true, "cat": true, "xxx": true,
	"post": true, "bike": true, "clothing": true, "guru": true, "holdings": true,
	"plumbing": true, "singles": true, "ventures": true, "voyage": true, "expert": true,
	"agency": true, "company": true, "estate": true, "gallery": true, "graphics": true,
	"lighting": true, "management": true, "menu": true, "photography": true, "solutions": true,
	"support": true, "systems": true, "technology": true, "tips": true, "today": true,
	"training": true, "directory": true, "kitchen": true, "land": true, "construction": true,
	"contractors": true, "diamonds": true, "enterprises": true, "equipment": true,
	"recipes": true, "shoes": true, "tattoo": true, "uno": true, "academy": true, "cab": true,
	"camera": true, "camp": true, "center": true, "computer": true, "education": true,
	"email": true, "glass": true, "institute": true, "international": true, "marketing": true,
	"pub": true, "repair": true, "social": true, "supply": true, "wiki": true, "xyz": true,
	"club": true, "digital": true, "link": true, "lol": true, "ltd": true, "moe": true,
	"ong": true, "online": true, "store": true, "tech": true, "site": true, "space": true,
	"website": true, "fun": true, "host": true, "press": true, "live": true, "cloud": true,
	"page": true, "tv": true, "cc": true, "ly": true, "gg": true, "to": true, "fm": true,
	"ac": true, "sh": true, "ws": true,
}

func urlValidTld(url string) bool {
	idx := strings.Index(url, "://")
	host := url
	if idx >= 0 {
		host = url[idx+3:]
	}
	if pathIdx := strings.Index(host, "/"); pathIdx >= 0 {
		host = host[:pathIdx]
	}
	if portIdx := strings.Index(host, ":"); portIdx >= 0 {
		host = host[:portIdx]
	}
	lastDot := strings.LastIndex(host, ".")
	if lastDot < 0 {
		return false
	}
	tld := strings.ToLower(host[lastDot+1:])
	return validTLDs[tld]
}

// ---- ZIP valid ----

func zipValid(zip string) bool {
	digits := extractDigitString(zip)
	return len(digits) >= 5 && !strings.HasPrefix(digits, "000")
}

// ---- Date plausibility ----

var monthNames = []string{
	"january", "february", "march", "april", "may", "june",
	"july", "august", "september", "october", "november", "december",
	"jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "oct", "nov", "dec",
}

func validDate(text string) bool {
	lower := strings.ToLower(text)
	for _, m := range monthNames {
		if strings.Contains(lower, m) {
			return true
		}
	}
	digits := extractDigitString(text)
	return len(digits) >= 4
}
