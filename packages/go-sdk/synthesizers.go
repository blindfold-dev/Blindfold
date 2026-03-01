package blindfold

import (
	"fmt"
	"math/rand"
	"strings"
	"unicode"
)

const (
	digits = "0123456789"
	upper  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	lower  = "abcdefghijklmnopqrstuvwxyz"
	hexC   = "0123456789abcdef"
)

// SynthesizeValue generates a fake replacement for the given entity type.
func SynthesizeValue(entityType, originalText string) string {
	switch entityType {
	case EntityEmailAddress:
		return synthesizeEmail()
	case EntityURL:
		return synthesizeURL()
	case EntityIPAddress:
		return synthesizeIP()
	case EntityCreditCard:
		return synthesizeCreditCard(originalText)
	case EntityIBAN:
		return synthesizeIBAN(originalText)
	default:
		return formatPreserving(originalText)
	}
}

func formatPreserving(original string) string {
	runes := []rune(original)
	result := make([]rune, len(runes))
	for i, ch := range runes {
		switch {
		case unicode.IsDigit(ch):
			result[i] = rune(digits[rand.Intn(10)])
		case unicode.IsUpper(ch):
			result[i] = rune(upper[rand.Intn(26)])
		case unicode.IsLower(ch):
			result[i] = rune(lower[rand.Intn(26)])
		default:
			result[i] = ch
		}
	}
	out := string(result)
	if out == original {
		return formatPreserving(original)
	}
	return out
}

func synthesizeEmail() string {
	return "user" + randHex(8) + "@example.com"
}

func synthesizeURL() string {
	return "https://example.com/" + randHex(10)
}

func synthesizeIP() string {
	a := rand.Intn(254) + 1
	b := rand.Intn(256)
	c := rand.Intn(256)
	d := rand.Intn(254) + 1
	return fmt.Sprintf("%d.%d.%d.%d", a, b, c, d)
}

func synthesizeCreditCard(original string) string {
	var digitCount int
	for _, ch := range original {
		if unicode.IsDigit(ch) {
			digitCount++
		}
	}
	if digitCount < 2 {
		return formatPreserving(original)
	}

	payload := make([]int, digitCount)
	for i := 0; i < digitCount-1; i++ {
		payload[i] = rand.Intn(10)
	}

	// Luhn check digit
	total := 0
	for i := digitCount - 2; i >= 0; i-- {
		d := payload[i]
		if (digitCount-2-i)%2 == 0 {
			d *= 2
			if d > 9 {
				d -= 9
			}
		}
		total += d
	}
	payload[digitCount-1] = (10 - (total % 10)) % 10

	// Re-insert separators
	var result strings.Builder
	idx := 0
	for _, ch := range original {
		if unicode.IsDigit(ch) {
			result.WriteByte(byte('0' + payload[idx]))
			idx++
		} else {
			result.WriteRune(ch)
		}
	}
	return result.String()
}

func synthesizeIBAN(original string) string {
	stripped := strings.ReplaceAll(original, " ", "")
	length := len(stripped)
	if length < 5 {
		return formatPreserving(original)
	}

	bbanLen := length - 4
	var bban strings.Builder
	for i := 0; i < bbanLen; i++ {
		bban.WriteByte(byte('0' + rand.Intn(10)))
	}

	// Calculate check digits: "XX00" + bban → numeric → mod-97
	numericStr := bban.String() + "333300"
	remainder := int64(0)
	for _, ch := range numericStr {
		remainder = (remainder*10 + int64(ch-'0')) % 97
	}
	checkDigits := fmt.Sprintf("%02d", 98-remainder)
	iban := "XX" + checkDigits + bban.String()

	if strings.Contains(original, " ") {
		var result strings.Builder
		ibanIdx := 0
		for _, ch := range original {
			if ch == ' ' {
				result.WriteRune(' ')
			} else if ibanIdx < len(iban) {
				result.WriteByte(iban[ibanIdx])
				ibanIdx++
			} else {
				result.WriteByte('0')
			}
		}
		return result.String()
	}
	return iban
}

func randHex(length int) string {
	var b strings.Builder
	for i := 0; i < length; i++ {
		b.WriteByte(hexC[rand.Intn(16)])
	}
	return b.String()
}
