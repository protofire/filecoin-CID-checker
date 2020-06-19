package test

func Uint64InSlice(a uint64, list []uint64) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
