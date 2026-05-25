/**
 * Algorithm Education Data — Educational content for each algorithm.
 * Contains theory, historical origins, analogies ("For Dummies"), and pseudocode.
 * Supports English and Polish languages.
 */

export interface AlgorithmEducation {
  /** Formal academic description. */
  theory: string;
  theory_pl: string;
  /** Historical context. */
  history: string;
  history_pl: string;
  /** Real-world analogy. */
  forDummies: string;
  forDummies_pl: string;
  /** High-level pseudocode (language-agnostic). */
  pseudocode: string;
}

export interface TranslatedEducation {
  theory: string;
  history: string;
  forDummies: string;
  pseudocode: string;
}

export const ALGORITHM_EDUCATION: Record<string, AlgorithmEducation> = {
  "merge-sort": {
    theory:
      "Merge Sort is a stable, divide-and-conquer sorting algorithm. It divides the array into halves, sorts them recursively, and merges the results.",
    theory_pl:
      "Sortowanie przez scalanie (Merge Sort) to klasyczny, stabilny algorytm sortowania oparty na paradygmacie „dziel i zwyciężaj” (Divide and Conquer), opracowany przez wybitnego matematyka Johna von Neumanna w 1945 roku.\n\nAlgorytm działa poprzez rekurencyjny podział nieuporządkowanej tablicy na coraz mniejsze podtablice, aż do osiągnięcia pojedynczych elementów (które z definicji są posortowane). Następnie rozpoczyna się kluczowa faza scalania (merge), w której sąsiednie, uporządkowane podtablice są łączone w jedną, większą i w pełni posortowaną strukturę.\n\nProces scalania wymaga utworzenia tymczasowej tablicy pomocniczej o rozmiarze proporcjonalnym do scalanych elementów. Porównujemy najmniejsze elementy z obu podlist i mniejszy z nich przepisujemy do tablicy pomocniczej, przesuwając wskaźnik. Gwarantuje to stabilność sortowania – elementy o tych samych kluczach zachowują swoją pierwotną kolejność wzajemną.\n\nZłożoność obliczeniowa algorytmu wynosi stabilne O(n log n) we wszystkich trzech przypadkach (pesymistycznym, średnim oraz optymistycznym), co czyni go niezwykle przewidywalnym. Główną wadą jest jednak złożoność pamięciowa O(n), wynikająca z konieczności alokacji dodatkowego obszaru pamięci na scalane fragmenty.",
    history:
      "Invented by John von Neumann in 1945 as part of early computing research.",
    history_pl:
      "Wynaleziony przez Johna von Neumanna w 1945 roku w ramach wczesnych badań nad komputeryzacją.",
    forDummies:
      "Sorting a deck of cards by splitting it into smaller and smaller piles, then combining them in order.",
    forDummies_pl:
      "Wyobraź sobie, że masz na stole gigantyczny, całkowicie pomieszany stos 100 klasówek uczniów, które musisz ułożyć alfabetycznie. Zamiast męczyć się ze wszystkimi naraz, stosujesz sprytną taktykę dzielenia problemu na mniejsze części.\n\nKrok 1: Dzielisz wielki stos na dwie równe części po 50 klasówek. Nadal jest to zbyt trudne? Dzielisz je na stosy po 25, potem po 12, aż w końcu lądujesz z 100 pojedynczymi kartkami leżącymi na stole. Każda pojedyncza kartka jest „posortowana sama w sobie”.\n\nKrok 2: Teraz czas na magię, czyli „scalanie”. Bierzesz dwa pojedyncze arkusze (np. Kowalskiego i Nowaka), patrzysz, który jest pierwszy w alfabecie, układasz je w dwuelementowy mini-stosik. Robisz to samo dla wszystkich pozostałych pojedynczych kartek.\n\nKrok 3: Teraz łączysz ze sobą dwuelementowe stosiki w czteroelementowe. Porównujesz tylko pierwsze kartki z wierzchu każdego stosu – ta, która powinna być wcześniej, ląduje na dole nowego stosu. Dzięki temu, że mniejsze stosiki są już posortowane, scalenie ich jest bajecznie szybkie.\n\nPowtarzasz to łączenie, aż z powrotem otrzymasz jeden wielki stos 100 kartek. Praca przebiegła bez porównywania każdej kartki z każdą inną, co zaoszczędziło Ci mnóstwo czasu i frustracji!",
    pseudocode: `procedure mergeSort(arr):
    if length > 1:
        left = mergeSort(firstHalf)
        right = mergeSort(secondHalf)
        return merge(left, right)`,
  },
  "quick-sort": {
    theory:
      "Quick Sort is an efficient, comparison-based algorithm using a pivot element to partition the array.",
    theory_pl:
      "Sortowanie szybkie (Quick Sort) to jeden z najpopularniejszych i najbardziej efektywnych algorytmów sortowania opartych na porównaniach, zaprojektowany przez Tony'ego Hoare'a w 1959 roku. Działa w oparciu o zasadę „dziel i zwyciężaj”, lecz w przeciwieństwie do sortowania przez scalanie, cała ciężka praca wykonywana jest na etapie podziału (partitioning), a scalanie jest zbędne, gdyż operacje odbywają się bezpośrednio w oryginalnej pamięci tablicy (in-place).\n\nAlgorytm rozpoczyna się od wyboru elementu osiowego (tzw. pivot). Wybór ten może być statyczny (np. pierwszy lub ostatni element) bądź losowy (co zapobiega degradacji wydajności). Następnie tablica jest partycjonowana: wszystkie elementy mniejsze od pivota są przesuwane na lewą stronę, a elementy większe lub równe na prawą. Po tej operacji pivot znajduje się na swojej ostatecznej, docelowej pozycji. Algorytm jest następnie wywoływany rekurencyjnie dla lewej i prawej podtablicy.\n\nŚrednia oraz optymistyczna złożoność obliczeniowa Quick Sort wynosi O(n log n). Jednak w najgorszym scenariuszu (np. gdy wybieramy skrajne elementy z już posortowanej tablicy jako pivot) złożoność degraduje się do O(n²). Algorytm ten jest niestabilny, ale ze względu na bardzo mały narzut pamięciowy O(log n) wynikający ze stosu wywołań rekurencyjnych oraz doskonałe wykorzystanie pamięci podręcznej procesora (cache locality), jest w praktyce znacznie szybszy od wielu innych algorytmów.",
    history: "Developed by Tony Hoare in 1959 at Moscow State University.",
    history_pl:
      "Opracowany przez Tony'ego Hoare'a w 1959 roku na Moskiewskim Uniwersytecie Państwowym.",
    forDummies:
      "Picking a leader in a crowd and making shorter people stand on the left and taller on the right.",
    forDummies_pl:
      "Wyobraź sobie grupę dzieci na lekcji WF-u o różnym wzroście, które stoją w totalnym chaosie. Nauczyciel chce je szybko ustawić od najniższego do najwyższego. Zamiast żmudnie porównywać każde dziecko z każdym, stosuje metodę lidera.\n\nKrok 1: Nauczyciel wskazuje jedno losowe dziecko (np. Tomka) i mówi: „Tomek, jesteś naszym liderem (pivotem)”. Tomek staje na środku sali.\n\nKrok 2: Nauczyciel wydaje komendę: „Wszystkie dzieci niższe od Tomka przechodzą na lewą stronę sali, a wszystkie wyższe lub równe na prawą!”. Dzieci szybko się dzielą na dwie grupy. Teraz Tomek wie na 100%, że stoi dokładnie na swoim właściwym miejscu.\n\nKrok 3: Nauczyciel powtarza dokładnie to samo zadanie dla grupy po lewej stronie Tomka (wybierając nowego lidera tej podgrupy) oraz dla grupy po prawej.\n\nProces powtarza się, aż każda podgrupa będzie składać się z tylko jednej osoby. W tym momencie wszystkie dzieci stoją w perfekcyjnym ordynku. To niesamowicie szybki sposób, bo dzieci poruszają się w grupach, a nie pojedynczo!",
    pseudocode: `procedure quickSort(arr, low, high):
    if low < high:
        p = partition(arr, low, high)
        quickSort(arr, low, p-1)
        quickSort(arr, p+1, high)`,
  },
  "bubble-sort": {
    theory:
      "Bubble Sort is a simple comparison algorithm that repeatedly steps through the list, swaps adjacent elements if they are in the wrong order.",
    theory_pl:
      "Sortowanie bąbelkowe (Bubble Sort) to jeden z najprostszych i najbardziej intuicyjnych algorytmów sortowania. Jego nazwa wywodzi się z faktu, że większe (lub cięższe) elementy w tablicy podczas kolejnych przejść pętli stopniowo „wypływają” (przesuwają się) na koniec struktury, zupełnie jak bąbelki powietrza w wodzie.\n\nZasada działania opiera się na wielokrotnym przeglądaniu tablicy od początku do końca. Inicjowana jest wewnętrzna pętla porównująca sąsiednie elementy. Jeżeli ich kolejność jest nieprawidłowa (np. lewy jest większy od prawego), następuje ich zamiana (swap). Proces ten powtarzamy tak długo, aż podczas całego przejścia przez tablicę nie dokonamy ani jednej zamiany, co oznacza, że zbiór jest w pełni uporządkowany.\n\nPod względem wydajności algorytm ten jest skrajnie nieefektywny. Zarówno w przypadku średnim, jak i najgorszym, jego złożoność czasowa wynosi O(n²), co dyskwalifikuje go z jakichkolwiek profesjonalnych zastosowań dla dużych zbiorów danych. Jedyną zaletą jest optymistyczna złożoność O(n) przy tablicy już posortowanej (jeśli zaimplementujemy flagę wykrywającą brak zamian) oraz minimalna złożoność pamięciowa O(1).",
    history:
      "One of the oldest algorithms; documented by 1956 but possibly used earlier in mechanical sorting.",
    history_pl:
      "Jeden z najstarszych algorytmów; udokumentowany w 1956 roku, ale prawdopodobnie używany wcześniej w sortowaniu mechanicznym.",
    forDummies:
      "Heavier bubbles in a carbonated drink sink to the bottom while lighter ones rise to the top.",
    forDummies_pl:
      "Wyobraź sobie kolejkę pięciu osób stojących w kinie, które chcą się ustawić według wieku – od najmłodszego do najstarszego. Stoją w kolejności: [Marek (40 lat), Ania (20 lat), Jan (60 lat), Kasia (10 lat), Piotr (30 lat)].\n\nKrok 1: Porównujesz pierwszych dwóch: Marek (40) i Ania (20). Marek jest starszy, więc zamieniają się miejscami. Kolejka: [Ania, Marek, Jan, Kasia, Piotr].\n\nKrok 2: Porównujesz kolejnych dwóch: Marek (40) i Jan (60). Jan jest starszy, więc zostają na swoich miejscach.\n\nKrok 3: Porównujesz Jan (60) i Kasia (10). Jan jest starszy, zamieniają się! Kolejka: [Ania, Marek, Kasia, Jan, Piotr].\n\nKrok 4: Porównujesz Jan (60) i Piotr (30). Jan jest starszy, zamiana. Kolejka: [Ania, Marek, Kasia, Piotr, Jan]. Najstarszy Jan (60) dotarł na sam koniec jak wielki bąbel!\n\nKrok 5: Teraz powtarzasz całą procedurę od początku dla pozostałych osób, pomijając już Jana, który jest na właściwym miejscu.\n\nRobisz tak kolejne okrążenia, aż cała kolejka będzie stać idealnie. To proste, ale wymaga mnóstwa dreptania i ciągłych zamian miejscami!",
    pseudocode: `for i from 0 to n:
    for j from 0 to n-i-1:
        if arr[j] > arr[j+1]: swap(j, j+1)`,
  },
  "heap-sort": {
    theory:
      "Heap Sort uses a binary heap data structure to find the maximum element and move it to the end of the array.",
    theory_pl:
      "Sortowanie przez kopcowanie (Heap Sort) to zaawansowany algorytm sortowania oparty na porównaniach, który wykorzystuje strukturę danych zwaną kopcem binarnym (binary heap). Został zaproponowany przez J. W. J. Williamsa w 1964 roku. Kopiec to kompletne drzewo binarne, w którym spełniony jest tzw. warunek kopca – w przypadku kopca typu Max (Max-Heap), wartość każdego rodzica jest większa lub równa wartościom jego dzieci.\n\nAlgorytm dzieli się na dwa główne etapy:\n1. Budowa kopca (Heapify): Przekształcamy wejściową, nieuporządkowaną tablicę w kopiec typu Max. Największy element automatycznie ląduje w korzeniu (na indeksie 0 tablicy).\n2. Właściwe sortowanie: Krok po kroku zamieniamy element z korzenia (największy) z ostatnim elementem nieposortowanej części tablicy. Zmniejszamy wirtualny rozmiar kopca o 1 i wywołujemy procedurę naprawy kopca (down-heapify) dla nowego korzenia, aby przywrócić jego własności. Proces ten powtarzamy, aż w kopcu pozostanie tylko jeden element.\n\nZłożoność czasowa Heap Sort wynosi gwarantowane O(n log n) we wszystkich przypadkach (najgorszym, średnim i najlepszym). Dodatkowo sortowanie odbywa się w miejscu (in-place) ze złożonością pamięciowa O(1). Mimo znakomitych gwarancji teoretycznych, w praktyce bywa nieco wolniejszy od Quick Sort ze względu na gorszą lokalność pamięci podręcznej. Jest to algorytm niestabilny.",
    history:
      "Proposed by J. W. J. Williams in 1964, who also described the heap data structure.",
    history_pl:
      "Zaproponowany przez J. W. J. Williamsa w 1964 roku, który opisał również samą strukturę kopca.",
    forDummies:
      "Organizing people into a pyramid where the oldest is always at the top, then taking them away one by one.",
    forDummies_pl:
      "Wyobraź sobie, że organizujesz turniej sportowy, w którym bierze udział grupa zawodników. Chcesz ich uszeregować według wyników od najlepszego do najgorszego. Zamiast bezpośrednio porównywać każdego z każdym, budujesz piramidę hierarchiczną.\n\nKrok 1: Układasz wszystkich zawodników w piramidę (drzewo binarne), w której na samej górze zawsze stoi absolutny lider (maksimum), a każdy menedżer w piramidzie jest lepszy od swoich bezpośrednich dwóch podwładnych. To jest Twój kopiec.\n\nKrok 2: Zabierasz lidera z samego szczytu piramidy i wysyłasz go do szatni (na koniec posortowanej tablicy).\n\nKrok 3: Na wolne miejsce na szczycie tymczasowo bierzesz najmniej doświadczonego zawodnika z samego dołu piramidy.\n\nKrok 4: Aby zachować sprawiedliwość, ten nowy lider musi „zjechać w dół” piramidy – porównuje się ze swoimi dwoma bezpośrednimi podwładnymi i zamienia się miejscami z tym, który jest od niego lepszy. Robi tak, dopóki nie znajdzie swojego poziomu kompetencji. Szczyt piramidy znów zajmuje najlepszy z pozostałych graczy.\n\nPowtarzasz zabieranie lidera ze szczytu i naprawianie piramidy, aż wszyscy zawodnicy wylądują w szatni, idealnie ustawieni od najlepszego do najgorszego!",
    pseudocode: `procedure heapSort(arr):
    buildMaxHeap(arr)
    for i from n-1 to 1:
        swap(arr[0], arr[i])
        heapify(arr, 0, i)`,
  },
  "binary-search": {
    theory:
      "Binary Search efficiently finds a target value within a sorted array by repeatedly halving the search interval.",
    theory_pl:
      "Wyszukiwanie binarne (Binary Search) to niezwykle efektywny algorytm wyszukiwania elementu w posortowanej tablicy. Wykorzystuje technikę „dziel i zwyciężaj”. Warunkiem koniecznym do działania algorytmu jest uprzednie posortowanie zbioru danych.\n\nDziałanie algorytmu polega na ciągłym porównywaniu szukanej wartości z elementem znajdującym się dokładnie w środku aktualnie rozpatrywanego przedziału.\n- Jeśli szukana wartość jest równa środkowemu elementowi, wyszukiwanie kończy się sukcesem.\n- Jeśli szukana wartość jest mniejsza od środkowego elementu, dalsze poszukiwania zawężamy wyłącznie do lewej połówki przedziału (odrzucając prawą połowę wraz ze środkiem).\n- Jeśli szukana wartość jest większa, poszukiwania zawężamy do prawej połówki.\nProces ten powtarza się rekurencyjnie lub iteracyjnie, aż element zostanie znaleziony lub przedział wyszukiwania stanie się pusty (co oznacza brak elementu w zbiorze).\n\nWyszukiwanie binarne cechuje się fantastyczną złożonością czasową O(log n). Dla tablicy o rozmiarze miliona elementów algorytm potrzebuje maksymalnie 20 kroków (porównań), aby odnaleźć element lub stwierdzić jego brak. Złożoność pamięciowa w wersji iteracyjnej wynosi minimalne O(1).",
    history:
      "A very old concept; binary search on a sorted list was first formally described by John Mauchly in 1946.",
    history_pl:
      "Bardzo stara koncepcja; wyszukiwanie binarne na posortowanej liście zostało po raz pierwszy opisane przez Johna Mauchly'ego w 1946 roku.",
    forDummies:
      "Opening a dictionary in the middle to find a word—deciding if the word is in the left or right half.",
    forDummies_pl:
      "Wyobraź sobie, że dostałeś do ręki grubą, papierową książkę telefoniczną (albo słownik) i musisz znaleźć nazwisko „Kowalski”. Książka jest posortowana alfabetycznie od A do Z. Jak to zrobisz?\n\nPodejście naiwne: Otwierasz pierwszą stronę i czytasz po kolei: Adamski, Adamiak... To zajmie wieki!\n\nPodejście binarne:\nKrok 1: Otwierasz książkę dokładnie na samym środku. Trafiasz na literę „M”.\nKrok 2: Zadajesz sobie pytanie: „Czy litera K jest przed M, czy po M?”. K jest wcześniej w alfabecie.\nKrok 3: W tym momencie odrzucasz całą prawą połowę książki (od M do Z) – na 100% nie ma tam Kowalskiego. Została Ci lewa połowa książki.\nKrok 4: Otwierasz tę pozostałą część dokładnie w połowie. Trafiasz na literę „F”. Ponieważ K jest po F, odrzucasz wszystko przed F.\nKrok 5: Powtarzasz ten proces szybkiego dzielenia na pół. W zaledwie kilku krokach trafiasz idealnie na stronę z nazwiskiem „Kowalski”.\n\nTo właśnie jest wyszukiwanie binarne! Dzięki porządkowi w danych eliminujesz połowę problemu przy każdym jednym spojrzeniu!",
    pseudocode: `while low <= high:
    mid = (low + high) / 2
    if arr[mid] == target: return mid
    else if arr[mid] < target: low = mid + 1
    else: high = mid - 1`,
  },
  "linear-search": {
    theory:
      "Linear Search checks every element of the list sequentially until the target is found or the list ends.",
    theory_pl:
      "Wyszukiwanie liniowe (Linear Search), nazywane również sekwencyjnym, to najbardziej podstawowa i intuicyjna metoda poszukiwania określonej wartości w zbiorze danych. W przeciwieństwie do wyszukiwania binarnego, wyszukiwanie liniowe nie wymaga żadnego wcześniejszego uporządkowania danych – może być stosowane na całkowicie chaotycznych listach.\n\nAlgorytm rozpoczyna pracę od pierwszego elementu tablicy (indeks 0) i porównuje go z poszukiwaną wartością (kluczem). Jeśli elementy są identyczne, wyszukiwanie kończy się sukcesem i zwracany jest indeks elementu. W przeciwnym razie algorytm przechodzi do kolejnej pozycji i powtarza porównanie. Proces trwa do momentu znalezienia szukanej wartości lub zbadania całego zbioru (wtedy zwracana jest wartość sygnalizująca brak elementu, zazwyczaj -1).\n\nZłożoność obliczeniowa w najgorszym scenariuszu wynosi O(n) – dzieje się tak, gdy szukany element znajduje się na samym końcu listy lub w ogóle w niej nie występuje (musimy wykonać n porównań). W najlepszym wypadku złożoność wynosi O(1), gdy trafimy na szukany obiekt już za pierwszym podejściem. Złożoność pamięciowa to stałe O(1).",
    history:
      "The most basic search method, used since the dawn of manual record keeping.",
    history_pl:
      "Najprostsza metoda wyszukiwania, używana od początków prowadzenia rejestrów.",
    forDummies:
      "Looking for a specific sock in a messy pile by checking every single sock one by one.",
    forDummies_pl:
      "Wyobraź sobie, że wchodzisz do pokoju i widzisz ogromną stertę czystego prania wysypanego na łóżko. Szukasz swojej ulubionej, czerwonej skarpetki w paski. Skarpetki leżą bez żadnego ładu i składu. Co robisz?\n\nBierzesz pierwszą skarpetkę z góry. „Czy to ta czerwona w paski? Nie, to czarna”. Odkładasz ją.\n\nBierzesz drugą. „Czy to ta? Nie, to biała sportowa”. Odkładasz ją.\n\nPowtarzasz to krok po kroku, skarpetka po skarpetce, aż w końcu wyciągniesz z głębi sterty tę właściwą, czerwoną w paski. Albo przeszukasz całą stertę i ze smutkiem stwierdzisz, że jej tam nie ma.\n\nTo jest właśnie wyszukiwanie liniowe. Jest proste, nie wymaga wcześniejszego układania skarpetek, ale jeśli sterta jest ogromna, a poszukiwana skarpetka leży na samym dnie (lub jest w pralce), będziesz musiał przejrzeć absolutnie każdą sztukę!",
    pseudocode: `for i from 0 to n-1:
    if arr[i] == target: return i
return -1`,
  },
  dijkstra: {
    theory:
      "Dijkstra's algorithm finds the shortest path between nodes in a weighted graph with non-negative edge weights.",
    theory_pl:
      "Algorytm Dijkstry to klasyczny i jeden z najważniejszych algorytmów grafowych, opracowany przez holenderskiego pioniera informatyki Edsgera W. Dijkstrę w 1956 roku. Służy do znajdowania najkrótszych ścieżek z jednego wierzchołka źródłowego do wszystkich pozostałych wierzchołków w grafie ważonym. Kluczowym ograniczeniem algorytmu jest wymóg, aby wszystkie wagi krawędzi były nieujemne (waga w >= 0).\n\nAlgorytm działa w sposób zachłanny (greedy):\n1. Inicjalizuje odległości do wszystkich wierzchołków jako nieskończoność (za wyjątkiem wierzchołka startowego, którego odległość wynosi 0).\n2. Przechowuje wierzchołki w kolejce priorytetowej, uporządkowanej według aktualnie najkrótszej znanej odległości od źródła.\n3. W każdej iteracji wybiera z kolejki wierzchołek u o najmniejszym dystansie, oznacza go jako odwiedzony (jego najkrótsza ścieżka jest już pewna).\n4. Dokonuje relaksacji krawędzi: dla każdego nieodwiedzonego sąsiada v wierzchołka u sprawdza, czy droga prowadząca do v przez u jest krótsza niż dotychczas znana ścieżka do v. Jeśli tak, aktualizuje odległość do v oraz jego poprzednika w kolejce.\n\nWydajność algorytmu zależy od implementacji kolejki priorytetowej. Przy zastosowaniu kopca binarnego złożoność czasowa wynosi O((V + E) log V), gdzie V to liczba wierzchołków, a E to liczba krawędzi. Złożoność pamięciowa to O(V) na przechowywanie odległości i struktury kolejki.",
    history:
      "Conceived by computer scientist Edsger W. Dijkstra in 1956 and published in 1959.",
    history_pl:
      "Opracowany przez informatyka Edsgera W. Dijkstrę w 1956 roku i opublikowany w 1959.",
    forDummies:
      "Finding the fastest driving route between two cities by exploring all possible roads systematically.",
    forDummies_pl:
      "Wyobraź sobie, że planujesz podróż samochodem z Warszawy do Lizbony i chcesz znaleźć najkrótszą pod względem kilometrów trasę. Masz mapę z miastami (wierzchołki) połączonymi drogami o określonych długościach (krawędzie z wagami).\n\nZaczynasz w Warszawie (odległość = 0). Do wszystkich innych miast na świecie wpisujesz na razie odległość jako „nieskończoność”.\n\nKrok 1: Patrzysz na sąsiednie miasta, do których możesz dojechać bezpośrednio: np. Berlin (600 km) i Praga (700 km). Wpisujesz te odległości do swojego notatnika.\n\nKrok 2: Wybierasz miasto, do którego znasz najkrótszą drogę z dotychczas odkrytych. Jest to Berlin (600 km). Berlin staje się Twoją nową bazą. Skoro to najbliższe miasto, nie ma fizycznej możliwości, by dojechać do niego jakąś inną, jeszcze krótszą drogą okrężną. Berlin jest „zaliczony”.\n\nKrok 3: Będąc w Berlinie, patrzysz na jego sąsiadów – np. do Paryża jest stąd kolejne 1000 km. Zatem łączna droga Warszawa -> Berlin -> Paryż to 1600 km. Porównujesz to z tym, co miałeś wcześniej wpisane dla Paryża (czyli nieskończoność) i aktualizujesz notatnik.\n\nKrok 4: Ponownie wybierasz z notatnika miasto o najmniejszej wartości, które nie zostało jeszcze „zaliczone” (np. Praga 700 km), i sprawdzasz drogi przez nie.\n\nDzięki temu metodycznemu rozszerzaniu bezpiecznej strefy wokół Warszawy, krok po kroku, bezbłędnie wyznaczasz absolutnie najkrótszą drogę do każdego miasta na mapie, w tym do Lizbony!",
    pseudocode: `while priority_queue is not empty:
    u = priority_queue.pop()
    for neighbor v of u:
        relax(u, v, weight)`,
  },
  bfs: {
    theory:
      "Breadth-First Search (BFS) explores all neighbors of a node before moving to the next level of neighbors.",
    theory_pl:
      "Przeszukiwanie wszerz (Breadth-First Search - BFS) to fundamentalny algorytm przeszukiwania i przejścia grafu lub struktury drzewiastej. Został opracowany niezależnie przez E. F. Moore'a w 1959 roku (do znajdowania najkrótszych dróg w labiryntach) oraz Konrada Zuse w 1945 roku. Algorytm bada graf poziomami (falowo), odwiedzając wszystkie wierzchołki znajdujące się w odległości k od wierzchołka startowego, zanim przejdzie do wierzchołków w odległości k+1.\n\nDo realizacji tego procesu BFS wykorzystuje strukturę kolejki FIFO (First-In, First-Out) oraz tablicę (lub zbiór) wierzchołków odwiedzonych, aby zapobiec zapętleniu.\n\nPrzebieg algorytmu:\n1. Umieszczamy wierzchołek startowy w kolejce i oznaczamy go jako odwiedzony.\n2. Dopóki kolejka nie jest pusta, pobieramy wierzchołek u z początku kolejki.\n3. Dla każdego nieodwiedzonego sąsiada v wierzchołka u: oznaczamy v jako odwiedzony i dodajemy go na koniec kolejki.\n\nZłożoność obliczeniowa BFS wynosi O(V + E), gdzie V to liczba wierzchołków, a E to liczba krawędzi w grafie. Wynika to z faktu, że każdy wierzchołek jest przetwarzany dokładnie raz, a każda krawędź jest badana maksymalnie dwukrotnie (w grafie nieskierowanym). Złożoność pamięciowa to O(V), co jest związane z przechowywaniem kolejki oraz informacji o odwiedzeniu. BFS idealnie nadaje się do znajdowania najkrótszej ścieżki w grafach bez wag (gdzie każda krawędź ma koszt 1).",
    history:
      "Invented by Konrad Zuse in 1945 (unpublished) and independently by E. F. Moore in 1959.",
    history_pl:
      "Wynaleziony przez Konrada Zuse w 1945 r. i niezależnie przez E. F. Moore'a w 1959 r.",
    forDummies:
      "A rumor spreading in a small town—everyone tells all their friends, then those friends tell all their friends.",
    forDummies_pl:
      "Wyobraź sobie, że rzucasz mały kamień na gładką taflę jeziora. W miejscu uderzenia tworzy się mały okrąg, który zaczyna równomiernie rozchodzić się na wszystkie strony w postaci kolejnych fal. To jest właśnie BFS!\n\nAlbo wyobraź sobie plotkę, która rozchodzi się w szkole:\nDzień 1: Ty (wierzchołek startowy) dowiadujesz się o plotce.\nDzień 2: Mówisz o tym trójce swoich najbliższych przyjaciół (sąsiedzi z poziomu 1). Oni są teraz w kolejce.\nDzień 3: Każdy z Twoich trzech przyjaciół opowiada o tym swoim kolejnym znajomym (sąsiedzi z poziomu 2). Plotka rozchodzi się koncentrycznymi kręgami.\n\nWszyscy na danym poziomie (np. wszyscy przyjaciele) muszą dowiedzieć się o plotce, zanim dowie się o niej ktokolwiek z następnego poziomu (znajomi przyjaciół). Dzięki temu, jeśli szukasz kogoś w tej sieci społecznościowej, BFS gwarantuje, że znajdziesz go najkrótszą możliwą drogą pod względem liczby pośredników!",
    pseudocode: `queue.push(root)
while queue:
    u = queue.pop()
    for v in neighbors(u): queue.push(v)`,
  },
  dfs: {
    theory:
      "Depth-First Search (DFS) explores as far as possible along each branch before backtracking.",
    theory_pl:
      "Przeszukiwanie w głąb (Depth-First Search - DFS) to jeden z fundamentalnych algorytmów przechodzenia grafów, którego korzenie sięgają prac francuskiego matematyka Charlesa Pierre'a Trémaux z XIX wieku nad metodami rozwiązywania labiryntów. DFS eksploruje graf, idąc tak głęboko, jak to tylko możliwe wzdłuż każdej gałęzi, zanim rozpocznie proces powrotu (backtracking) do ostatnich rozgałęzień.\n\nAlgorytm ten w naturalny sposób opiera się na strukturze stosu (LIFO) i najczęściej implementowany jest rekurencyjnie (gdzie stos wywołań kompilatora pełni rolę struktury danych).\n\nPrzebieg algorytmu:\n1. Odwiedź wierzchołek u, oznacz go jako odwiedzony, aby uniknąć cykli.\n2. Dla każdego nieodwiedzonego sąsiada v wierzchołka u, wywołaj rekurencyjnie funkcję DFS(v).\n3. Gdy wierzchołek u nie ma już żadnych nieodwiedzonych sąsiadów, następuje powrót (backtrack) do wierzchołka, z którego przyszliśmy, by sprawdzić inne odgałęzienia.\n\nPodobnie jak BFS, złożoność czasowa DFS wynosi O(V + E), ponieważ odwiedzamy każdy wierzchołek i sprawdzamy każdą krawędź skończoną liczbę razy. Złożoność pamięciowa wynosi O(V) w najgorszym scenariuszu (np. gdy graf jest jedną długą ścieżką, a stos wywołań ma wysokość V). DFS jest kluczowym elementem wielu zaawansowanych algorytmów, takich jak wykrywanie cykli, wyszukiwanie silnie spójnych składowych (algorytm Tarjana) czy sortowanie topologiczne.",
    history:
      "A version was investigated by French mathematician Charles Pierre Trémaux in the 19th century.",
    history_pl:
      "Wersja tego algorytmu była badana przez francuskiego matematyka Charlesa Pierre'a Trémaux już w XIX wieku.",
    forDummies:
      "Exploring a maze by following one path until you hit a wall, then turning back to the last split.",
    forDummies_pl:
      "Wyobraź sobie, że wchodzisz do tajemniczego, starożytnego labiryntu w poszukiwaniu skarbu. Masz w ręku grubą czerwoną nitkę (jak Tezeusz) oraz kredę do oznaczania korytarzy, w których już byłeś.\n\nKrok 1: Idziesz przed siebie pierwszym korytarzem, który zobaczysz. Na każdym skrzyżowaniu skręcasz losowo, ale zawsze idziesz w głąb. Na ścianach robisz krzyżyki kredą, żeby wiedzieć, gdzie już byłeś.\n\nKrok 2: Idziesz tak długo, aż trafisz w ślepy zaułek (ścianę). Nie możesz iść dalej.\n\nKrok 3: Wracasz po swojej nitce z powrotem do ostatniego skrzyżowania, na którym miałeś wybór. Sprawdzasz, czy jest tam korytarz bez Twojego oznaczenia kredą. Jeśli tak – wchodzisz w niego i znowu idziesz maksymalnie głęboko. Jeśli nie – cofasz się jeszcze dalej.\n\nDzięki tej taktyce masz absolutną pewność, że systematycznie sprawdzisz każdy zakamarek labiryntu bez kręcenia się w kółko! To przeciwieństwo BFS – zamiast badać teren szeroko i powoli wokół siebie, rzucasz się śmiało do przodu w jedną wybraną ścieżkę aż do samego końca.",
    pseudocode: `procedure DFS(u):
    visit(u)
    for v in neighbors(u): DFS(v)`,
  },
  "a-star": {
    theory:
      "A* Search is a pathfinding algorithm that uses heuristics to guide the search towards the goal more efficiently.",
    theory_pl:
      "Algorytm A* (A-Star) to niezwykle popularny i wysoce wydajny algorytm wyszukiwania ścieżki w grafie, opracowany w 1968 roku w Stanford Research Institute przez Petera Harta, Nilsa Nilssona i Bertrama Raphaela. Stanowi on rozszerzenie algorytmu Dijkstry, wzbogacone o mechanizmy heurystyczne, co pozwala drastycznie zmniejszyć liczbę przeszukiwanych wierzchołków i skierować poszukiwania bezpośrednio w stronę celu.\n\nA* szacuje całkowity koszt ścieżki przechodzącej przez dany wierzchołek n za pomocą funkcji oceny:\nf(n) = g(n) + h(n)\nGdzie:\n- g(n) to rzeczywisty, dokładny koszt dotarcia ze źródła do wierzchołka n (tak jak w algorytmie Dijkstry).\n- h(n) to koszt heurystyczny – szacowana droga od wierzchołka n do celu. Aby algorytm gwarantował znalezienie najkrótszej ścieżki (był optymalny), heurystyka musi być dopuszczalna (admissible), co oznacza, że nigdy nie może przeszacowywać rzeczywistego kosztu (np. odległość w linii prostej na mapie).\n\nW każdej iteracji algorytm wybiera z listy wierzchołków otwartych (Open List) ten o najmniejszej wartości f(n), przenosi go do listy zamkniętej (Closed List) i relaksuje jego sąsiadów.\n\nZłożoność obliczeniowa A* zależy od jakości heurystyki. Przy doskonałej heurystyce czas działania wynosi O(V), podczas gdy przy skrajnie nieskutecznej heurystyce (np. h(n) = 0) algorytm redukuje się do klasycznego algorytmu Dijkstry o złożoności O((V + E) log V).",
    history:
      "Developed at Stanford Research Institute in 1968 by Hart, Nilsson, and Raphael.",
    history_pl:
      "Opracowany w Stanford Research Institute w 1968 roku przez Harta, Nilssona i Raphaela.",
    forDummies:
      "Using a compass to always head generally toward the destination while avoiding obstacles.",
    forDummies_pl:
      "Wyobraź sobie, że stoisz w gęstym lesie i chcesz dojść do schroniska widocznego na szczycie góry przed Tobą.\n- Klasyczny algorytm Dijkstry działałby tak: Sprawdza wszystkie możliwe ścieżki wokół Ciebie w promieniu 10 metrów, potem 20 metrów, potem 30 metrów, w tym te ścieżki, które prowadzą w zupełnie przeciwnym kierunku. To bezpieczne, ale bardzo powolne.\n- Algorytm A* działa znacznie sprytniej: Oprócz mierzenia drogi, którą już przeszedłeś (g(n)), ma w ręku kompas i GPS, które pokazują mu odległość w linii prostej do schroniska (h(n)).\n\nKrok 1: Patrzysz na ścieżki wokół siebie. Jedna prowadzi na północ (w stronę schroniska), druga na południe (oddala się).\n\nKrok 2: Algorytm przypisuje ścieżce na północ bardzo niski koszt szacowany (bo idzie w dobrą stronę), a ścieżce na południe ogromny koszt.\n\nKrok 3: Wybierasz ścieżkę na północ. Jeśli trafisz na powalone drzewo (przeszkodę), algorytm chwilowo zboczy z drogi, ale cały czas będzie parł w kierunku wskazywanym przez kompas.\n\nDzięki temu A* nie marnuje czasu na sprawdzanie ścieżek, o których z góry wiadomo, że prowadzą w złym kierunku, i znajduje najkrótszą drogę do schroniska błyskawicznie!",
    pseudocode: `f(n) = g(n) + h(n)
while openList:
    n = best node in openList
    expand(n)`,
  },
  kruskal: {
    theory:
      "Kruskal's algorithm finds the Minimum Spanning Tree by sorting all edges and adding them if they don't form a cycle.",
    theory_pl:
      "Algorytm Kruskala to zachłanny algorytm służący do znajdowania Minimalnego Drzewa Rozpinającego (Minimum Spanning Tree - MST) w spójnym, ważonym grafie nieskierowanym. Został opublikowany przez Josepha Kruskala w 1956 roku. MST to taki podgraf, który łączy wszystkie wierzchołki grafu bez tworzenia cykli, a suma wag jego krawędzi jest najmniejsza z możliwych.\n\nAlgorytm Kruskala działa bezpośrednio na krawędziach grafu:\n1. Tworzy las rozpinający – na początku każdy wierzchołek stanowi osobne, jednoelementowe drzewo.\n2. Pobiera wszystkie krawędzie grafu i sortuje je rosnąco według wag.\n3. Przegląda posortowane krawędzie jedna po drugiej. Dla krawędzi łączącej wierzchołki u i v:\n   - Sprawdza, czy u oraz v należą do różnych drzew (co oznacza, że dodanie krawędzi nie utworzy cyklu).\n   - Jeśli należą do różnych drzew, krawędź jest dodawana do MST, a oba drzewa są łączone (scalane) w jedno.\n   - W przeciwnym razie krawędź jest odrzucana.\n\nDo błyskawicznego sprawdzania przynależności do drzew oraz ich scalania stosuje się strukturę danych zbiorów rozłącznych (Union-Find) z kompresją ścieżek.\n\nZłożoność obliczeniowa wynosi O(E log E) lub O(E log V) – co jest zdominowane przez etap sortowania krawędzi. Sam proces łączenia wierzchołków przy użyciu Union-Find jest niemal natychmiastowy.",
    history: "First published by Joseph Kruskal in 1956.",
    history_pl:
      "Po raz pierwszy opublikowany przez Josepha Kruskala w 1956 roku.",
    forDummies:
      "Connecting a group of islands with the cheapest possible bridges without creating unnecessary loops.",
    forDummies_pl:
      "Wyobraź sobie, że jesteś zarządcą archipelagu 10 wysp i chcesz połączyć je siecią światłowodową, budując mosty kablowe między wyspami. Firma budowlana dała Ci listę wszystkich możliwych połączeń wraz z wyceną każdego z nich. Chcesz połączyć wszystkie wyspy tak, by zapłacić jak najmniej, a komputery na każdej wyspie mogły komunikować się z pozostałymi.\n\nKrok 1: Wypisujesz wszystkie możliwe mosty na kartce i sortujesz je od najtańszego do najdroższego. Na początku każda wyspa jest samotna.\n\nKrok 2: Wybierasz absolutnie najtańszy most z listy (np. kosztujący tylko 1000 zł) i budujesz go. Dwie wyspy są połączone.\n\nKrok 3: Bierzesz kolejny najtańszy most. Budujesz go, o ile nie łączy on wysp, które już i tak mają ze sobą połączenie (np. okrężną drogą przez inne wybudowane mosty). Nie chcesz wydawać pieniędzy na tworzenie niepotrzebnych pętli!\n\nKrok 4: Powtarzasz to dla kolejnych mostów z listy. Jeśli jakiś most prowadziłby do wysp już połączonych pośrednio – skreślasz go i ignorujesz.\n\nGdy połączysz wszystkie wyspy w jedną wielką sieć (wybudujesz dokładnie 9 mostów dla 10 wysp), kończysz pracę. Gratulacje! Stworzyłeś najtańszą możliwą sieć bez ani jednej zbędnej pętli. To jest właśnie algorytm Kruskala!",
    pseudocode: `sort edges by weight
for edge(u, v):
    if find(u) != find(v): union(u, v)`,
  },
  prim: {
    theory:
      "Prim's algorithm finds the Minimum Spanning Tree by growing a single tree from an arbitrary starting node.",
    theory_pl:
      "Algorytm Prima to kolejny zachłanny algorytm służący do wyznaczania Minimalnego Drzewa Rozpinającego (MST) w spójnym, ważonym grafie nieskierowanym. Choć pierwotnie został odkryty przez czeskiego matematyka Vojtěcha Jarníka w 1930 roku, został spopularyzowany niezależnie przez Roberta Prima w 1957 roku oraz Edsgera Dijkstrę w 1959 roku.\n\nW przeciwieństwie do algorytmu Kruskala, który buduje MST, łącząc losowe krawędzie w całym grafie, algorytm Prima „rozrasta” jedno spójne drzewo krok po kroku, zaczynając od jednego, dowolnie wybranego wierzchołka startowego.\n\nPrzebieg algorytmu:\n1. Wybierz dowolny wierzchołek i dodaj go do drzewa MST.\n2. Utwórz zbiór krawędzi granicznych – takich, które łączą wierzchołki już będące w MST z wierzchołkami jeszcze do niego nienależącymi.\n3. Wybierz z tego zbioru krawędź o najmniejszej wadze. Dodaj łączony przez nią nowy wierzchołek oraz samą krawędź do MST.\n4. Zaktualizuj zbiór krawędzi granicznych o nowe połączenia wychodzące z właśnie dodanego wierzchołka.\n5. Powtarzaj kroki 3-4, dopóki wszystkie wierzchołki grafu nie znajdą się w drzewie.\n\nZłożoność obliczeniowa przy użyciu kopca binarnego wynosi O(E log V). Podobnie jak w algorytmie Dijkstry, zastosowanie zaawansowanego kopca Fibonacciego pozwala na teoretyczne przyspieszenie do O(E + V log V). Jest to algorytm niezwykle wydajny w przypadku grafów gęstych (o dużej liczbie krawędzi).",
    history:
      "Developed in 1930 by Jarník and later independently by Prim (1957) and Dijkstra (1959).",
    history_pl:
      "Opracowany w 1930 roku przez Jarníka, a później niezależnie przez Prima (1957) i Dijkstrę (1959).",
    forDummies:
      "Building a power grid starting from one house and always adding the closest neighbor to the network.",
    forDummies_pl:
      "Wyobraź sobie, że budujesz sieć elektryczną w nowo powstającym osiedlu domków jednorodzinnych. Zaczynasz od jednego centralnego transformatora (wierzchołek startowy). Twój cel to podłączyć kablem każdy dom, zużywając jak najmniej metrów drogiego kabla.\n\nKrok 1: Masz prąd w transformatorze. Patrzysz na domy stojące najbliżej niego. Najbliższy dom (A) jest oddalony o 5 metrów, a drugi dom (B) o 12 metrów.\n\nKrok 2: Oczywiście wybierasz dom A (5 metrów) i ciągniesz do niego kabel. Teraz prąd płynie już w transformatorze oraz w domu A. Te dwa punkty tworzą Twoją bezpieczną strefę.\n\nKrok 3: Teraz patrzysz na wszystkie domy nienależące do strefy, ale szukasz najkrótszego połączenia z dowolnego zasilanego już punktu (transformatora lub domu A). Okazuje się, że z domu A jest bardzo blisko do domu C (tylko 3 metry), a z transformatora do domu B wciąż jest 12 metrów.\n\nKrok 4: Wybierasz najkrótszą opcję: łączysz dom A z domem C kablem o długości 3 metrów. Teraz prąd płynie w trzech punktach.\n\nCiągle rozbudowujesz tę jedną, spójną sieć, zawsze wybierając najtańszy kabel łączący niepodłączony jeszcze dom z Twoją działającą już siecią. Nigdy nie budujesz kabli „na boku” – wszystko rośnie z jednego pnia. To jest właśnie algorytm Prima!",
    pseudocode: `while nodes_not_in_mst:
    u = min_edge_to_mst()
    add u to mst`,
  },
  "topo-sort": {
    theory:
      "Topological Sort linearly orders vertices of a directed acyclic graph (DAG) based on their dependencies.",
    theory_pl:
      "Sortowanie topologiczne to liniowe uporządkowanie wierzchołków w skierowanym grafie acyklicznym (DAG - Directed Acyclic Graph) w taki sposób, że dla każdej krawędzi skierowanej prowadzącej od wierzchołka u do wierzchołka v, u znajduje się przed v w uporządkowaniu. Jeśli graf zawiera choć jeden cykl, sortowanie topologiczne jest niemożliwe do wykonania.\n\nIstnieją dwie klasyczne metody realizacji sortowania topologicznego:\n1. Algorytm Kahna (1962): Opiera się na stopniu wejściowym wierzchołków (liczbie krawędzi wchodzących). Wybieramy wierzchołki o stopniu wejściowym 0 (które nie mają żadnych zależności), umieszczamy je w kolejce, a następnie wirtualnie usuwamy je z grafu wraz z krawędziami wychodzącymi, co zmniejsza stopnie wejściowe ich sąsiadów. Proces powtarzamy.\n2. Metoda oparta na przeszukiwaniu w głąb (DFS): Wykonujemy standardowe przejście DFS. Kiedy wierzchołek u zostanie w pełni przetworzony (wszyscy jego sąsiedzi zostaną odwiedzeni), umieszczamy go na początku listy wynikowej (lub na stosie). Po zakończeniu DFS dla całego grafu, stos zawiera poprawne sortowanie topologiczne.\n\nZłożoność czasowa obu metod wynosi O(V + E), a złożoność pamięciowa to O(V). Sortowanie topologiczne jest kluczowym narzędziem w systemach budowania oprogramowania (np. make, webpack), harmonogramowaniu zadań z zależnościami czy w silnikach bazodanowych.",
    history:
      "First described by Kahn in 1962 and later implemented using DFS by Tarjan.",
    history_pl:
      "Po raz pierwszy opisane przez Kahna w 1962 roku; później zaimplementowane przy użyciu DFS przez Tarjana.",
    forDummies:
      "Creating a to-do list where some tasks must be finished before others can start (like getting dressed).",
    forDummies_pl:
      "Wyobraź sobie poranek, kiedy musisz się ubrać przed wyjściem do pracy. Masz na łóżku ubrania, ale niektóre rzeczy musisz założyć w ściśle określonej kolejności – nie możesz przecież założyć butów przed skarpetkami, ani kurtki przed koszulą! Te zależności tworzą graf skierowany bez cykli.\n\nSkarpetki -> Buty\nBielizna -> Spodnie -> Buty\nKoszula -> Sweter -> Kurtka\n\nSortowanie topologiczne to ułożenie idealnego planu działania krok po kroku:\nKrok 1: Szukasz ubrań, które nie zależą od niczego innego (mają 0 zależności). Może to być Bielizna, Skarpetki i Koszula. Wybierasz jedno z nich, na przykład Skarpetki, i zakładasz je.\n\nKrok 2: Skoro masz już na sobie skarpetki, usuwasz je ze swojej listy zmartwień. Teraz Buty mają o jedną zależność mniej.\n\nKrok 3: Ponownie szukasz rzeczy bez niespełnionych zależności. Zakładasz Bieliznę, potem Spodnie, potem Koszulę, potem Sweter, potem Buty (które teraz są już w pełni odblokowane!), a na końcu Kurtkę.\n\nWynikowy ciąg ubrań gwarantuje, że nie popełnisz towarzyskiego ani fizycznego faux pas. Sortowanie topologiczne dba o to, by najpierw zrobić to, co przygotowuje grunt pod kolejne kroki!",
    pseudocode: `for each node:
    if not visited: DFS_visit(node)
push to stack after visiting neighbors`,
  },
  binary: {
    theory:
      "A Binary Tree is a tree where each node has at most two children, referred to as the left and right child.",
    theory_pl:
      "Drzewo binarne to jedna z najważniejszych i najbardziej fundamentalnych struktur danych w informatyce. Jest to struktura hierarchiczna składająca się z węzłów (nodes), w której każdy węzeł zawiera wartość (dane) oraz referencje (wskaźniki) do maksymalnie dwóch węzłów potomnych, tradycyjnie nazywanych lewym dzieckiem (left child) i prawym dzieckiem (right child).\n\nWęzeł, który nie posiada rodzica, nazywany jest korzeniem (root) drzewa i stanowi punkt wejścia do całej struktury. Węzły niemające dzieci nazywane są liśćmi (leaves). Wysokość drzewa to najdłuższa ścieżka od korzenia do liścia.\n\nDrzewa binarne mogą przybierać różne formy:\n- Drzewo pełne (full): każdy węzeł ma 0 lub 2 dzieci.\n- Drzewo kompletne (complete): wszystkie poziomy oprócz ewentualnie ostatniego są całkowicie zapełnione, a liście na ostatnim poziomie są ułożone od lewej strony.\n- Drzewo wyrodzone (degenerate): każdy węzeł ma tylko jedno dziecko, przez co struktura przypomina zwykłą listę jednokierunkową.\n\nDrzewo binarne samo w sobie nie narzuca żadnego porządku przechowywania danych, ale stanowi techniczną podstawę do budowy wysoce efektywnych struktur, takich jak drzewa przeszukiwań (BST), drzewa samobalansujące (AVL, czerwono-czarne) czy kopce.",
    history:
      "Fundamental to CS; the concept evolved with early linked list implementations in the 1950s.",
    history_pl:
      "Podstawa informatyki; koncepcja ewoluowała wraz z wczesnymi implementacjami list powiązanych w latach 50.",
    forDummies:
      "A family tree where every couple has exactly zero, one, or two children.",
    forDummies_pl:
      "Wyobraź sobie klasyczne drzewo genealogiczne danej rodziny, ale z jednym specyficznym ograniczeniem biologicznym: każda para lub osoba w tym drzewie może mieć co najwyżej dwójkę dzieci (np. starszego syna i młodszą córkę).\n\nNa samym szczycie drzewa znajduje się praojciec (Korzeń). Od niego odchodzą dwie gałęzie do jego dwójki dzieci. Od każdego z tych dzieci mogą odchodzić kolejne dwie gałęzie do ich dzieci (wnuków praojca).\n\nOsoby na samym dole, które nie doczekały się potomstwa, to Liście.\n\nTaka struktura jest niesamowicie wygodna dla komputerów, ponieważ przy każdym kroku w dół drzewa podejmujemy prostą decyzję binarną: „idę w lewo czy w prawo?”. Pozwala to w bardzo naturalny sposób dzielić informacje i szybko nimi zarządzać.",
    pseudocode: `node = { value, left, right }`,
  },
  bst: {
    theory:
      "A Binary Search Tree (BST) maintains sorted data, with smaller values in the left subtree and larger in the right.",
    theory_pl:
      "Binarne drzewo poszukiwań (Binary Search Tree - BST) to struktura danych oparta na drzewie binarnym, która narzuca ścisły porządek na przechowywane elementy w celu umożliwienia błyskawicznego wyszukiwania, wstawiania oraz usuwania danych.\n\nKluczowa własność drzewa BST głosi, że dla każdego węzła X:\n- Wszystkie wartości znajdujące się w jego lewym poddrzewie muszą być ściśle mniejsze od wartości węzła X.\n- Wszystkie wartości w jego prawym poddrzewie muszą być ściśle większe (lub równe, zależnie od przyjętej konwencji dotyczącej duplikatów) od wartości węzła X.\n\nDzięki tej strukturze, proces wyszukiwania wartości przypomina wyszukiwanie binarne. Zantosując podejście rekurencyjne, zaczynając od korzenia, porównujemy szukaną wartość z wartością bieżącego węzła. Jeśli jest mniejsza – przechodzimy do lewego dziecka; jeśli większa – do prawego. Proces ten ma złożoność O(log n).\n\nZłożoność obliczeniowa operacji wyszukiwania, wstawiania i usuwania w zbalansowanym drzewie BST wynosi O(log n). Jednak w najgorszym przypadku (gdy wstawiamy elementy już posortowane), drzewo wyradza się w listę liniową, a złożoność wzrasta do nieakceptowalnego O(n). Aby temu zapobiec, stosuje się drzewa samobalansujące.",
    history:
      "Independent development by researchers like Windley and Booth in the 1960s.",
    history_pl:
      "Opracowane niezależnie przez badaczy takich jak Windley i Booth w latach 60.",
    forDummies:
      "A filing cabinet where everything to the left is smaller and everything to the right is bigger.",
    forDummies_pl:
      "Wyobraź sobie, że jesteś bibliotekarzem i chcesz poukładać książki na specjalnym regale tak, aby każdy czytelnik mógł znaleźć dowolną książkę w kilka sekund bez przeglądania całego księgozbioru. Postanawiasz zbudować regał w kształcie drzewa BST.\n\nNa samym środku regału stawiasz książkę z numerem 50 (Korzeń).\n\nKrok 1: Przychodzi czytelnik z książką o numerze 30. Patrzy na korzeń (50). Ponieważ 30 jest mniejsze niż 50, bibliotekarz kieruje go na lewą gałąź.\n\nKrok 2: Na lewej gałęzi wisi książka 20. Ponieważ 30 jest większe niż 20, czytelnik idzie na prawą podgałąź od węzła 20. Tam umieszcza swoją książkę.\n\nKrok 3: Kiedy ktoś inny chce znaleźć książkę o numerze 30, przechodzi dokładnie tę samą drogę. Porównuje tylko: „30 jest mniejsze niż 50? Tak, idę w lewo. 30 jest większe niż 20? Tak, idę w prawo. O, jest moja książka!”.\n\nDzięki temu, zamiast przeszukiwać setki półek, czytelnik wykonuje tylko trzy szybkie porównania. To niesamowity porządek, który drastycznie skraca czas szukania!",
    pseudocode: `if val < node.val: insert(left)
else: insert(right)`,
  },
  avl: {
    theory:
      "An AVL Tree is a self-balancing BST where the heights of subtrees differ by at most one.",
    theory_pl:
      "Drzewo AVL (nazwane od nazwisk jego radzieckich twórców: Gieorgija Adelsona-Wielskiego i Jewgienija Landisa, którzy opublikowali je w 1962 roku) to pierwsze w historii informatyki samobilansujące się binarne drzewo poszukiwań (BST). Jego celem jest eliminacja wady klasycznych drzew BST, czyli ryzyka wyrodzenia się struktury w liniową listę o złożoności O(n).\n\nW drzewie AVL każdy węzeł przechowuje tzw. współczynnik wyważenia (balance factor), który jest różnicą wysokości lewego i prawego poddrzewa:\nWspółczynnik = Wysokość(Lewe) - Wysokość(Prawe)\n\nWłasność drzewa AVL wymaga, aby dla każdego węzła współczynnik ten wynosił -1, 0 lub 1. Jeżeli po operacji wstawienia (insertion) lub usunięcia (deletion) elementu współczynnik wyważenia w którymkolwiek węźle osiągnie wartość -2 lub 2, oznacza to utratę stabilności hierarchii. W celu przywrócenia równowagi algorytm wykonuje specyficzne operacje reorganizacji wskaźników, zwane rotacjami drzewa:\n- Rotacja pojedyncza w lewo (RR) lub w prawo (LL).\n- Rotacja podwójna lewo-prawo (LR) lub prawo-lewo (RL).\n\nZłożoność obliczeniowa wyszukiwania, wstawiania oraz usuwania w drzewie AVL wynosi gwarantowane O(log n) zarówno w średnim, jak i najgorszym przypadku. Drzewo to jest bardziej rygorystycznie zbalansowane niż drzewo czerwono-czarne, co zapewnia szybsze wyszukiwanie kosztem nieco droższych operacji modyfikacji struktury.",
    history: "Named after Adelson-Velsky and Landis, who published it in 1962.",
    history_pl:
      "Nazwa pochodzi od nazwisk Adelson-Velsky i Landis, którzy opublikowali algorytm w 1962 roku.",
    forDummies:
      "A balanced mobile that automatically adjusts itself so it doesn't tilt too far to one side.",
    forDummies_pl:
      "Wyobraź sobie wiszącą ozdobę nad łóżeczkiem dziecka (tzw. karuzelę mobilną), na której wiesza się zabawki. Karuzela ma ramiona i musi być idealnie pozioma. Jeśli powiesisz zbyt wiele zabawek po jednej stronie, cała konstrukcja niebezpiecznie się przechyli.\n\nDrzewo AVL to taka inteligentna karuzela:\n\nKrok 1: Dodajesz nową zabawkę na lewym skrajnym ramieniu.\n\nKrok 2: Konstrukcja wykrywa, że lewa strona stała się o dwa poziomy cięższa niż prawa (współczynnik wyważenia wynosi +2). Karuzela grozi upadkiem.\n\nKrok 3: Automatycznie uruchamia się wewnętrzny silniczek, który wykonuje tzw. „rotację” – chwyta jeden z niższych elementów, przesuwa go w górę i czyni nowym punktem podparcia, a stary szczyt ściąga lekko w dół.\n\nKrok 4: Po tym szybkim tańcu elementów karuzela znowu wisi idealnie prosto i stabilnie.\n\nDzięki temu drzewo AVL nigdy nie pozwoli, by jedna ścieżka była rażąco dłuższa od innych. Zawsze zachowuje piękny, niemal idealnie symetryczny kształt, co gwarantuje błyskawiczne odnajdywanie danych!",
    pseudocode: `if balanceFactor > 1: rotate()`,
  },
  rbt: {
    theory:
      "A Red-Black Tree is a self-balancing BST that uses an extra bit per node to ensure the tree remains approximately balanced.",
    theory_pl:
      "Drzewo czerwono-czarne (Red-Black Tree - RBT) to zaawansowana i wysoce efektywna struktura danych będąca samobilansującym się binarnym drzewem poszukiwań. Została wynaleziona przez Rudolfa Bayera w 1972 roku pod nazwą „symetryczne binarne B-drzewa”, a obecną nazwę i szczegółową analizę nadali jej Leo J. Guibas i Robert Sedgewick w 1978 roku.\n\nKażdy węzeł w drzewie RBT przechowuje dodatkowy bit informacji reprezentujący kolor węzła – czerwony lub czarny. Równowaga drzewa jest utrzymywana poprzez rygorystyczne przestrzeganie pięciu specyficznych reguł (własności):\n1. Każdy węzeł jest albo czerwony, albo czarny.\n2. Korzeń drzewa jest zawsze czarny.\n3. Każdy liść (węzeł reprezentowany jako NIL/NULL) jest czarny.\n4. Jeśli węzeł jest czerwony, to oboje jego dzieci muszą być czarne (czerwoni sąsiedzi nie mogą występować bezpośrednio obok siebie w relacji rodzic-dziecko).\n5. Każda ścieżka od wybranego węzła do dowolnego liścia potomnego musi zawierać dokładnie tyle samo czarnych węzłów (własność czarnej wysokości).\n\nPodczas wstawiania lub usuwania elementów te reguły mogą zostać naruszone. Przywrócenie porządku następuje poprzez recoloring (zmianę kolorów węzłów) oraz rotacje drzewa. Dzięki tym regułom najdłuższa ścieżka od korzenia do liścia jest co najwyżej dwukrotnie dłuższa od najkrótszej ścieżki. Złożoność obliczeniowa wszystkich podstawowych operacji wynosi gwarantowane O(log n) w najgorszym scenariuszu.",
    history:
      "Invented by Rudolf Bayer in 1972 (as symmetric binary B-trees); named 'Red-Black' by Guibas and Sedgewick in 1978.",
    history_pl:
      "Wynalezione przez Rudolfa Bayera w 1972 roku; nazwane „czerwono-czarnym” przez Guibasa i Sedgewicka w 1978.",
    forDummies:
      "A traffic light system for a tree to prevent any one path from getting twice as long as any other.",
    forDummies_pl:
      "Wyobraź sobie, że zarządzasz ekskluzywnym klubem nocnym, w którym obowiązują bardzo surowe zasady wpuszczania gości. Twoim celem jest utrzymanie porządku w kolejce wewnątrz klubu. Każdy gość otrzymuje opaskę: czerwoną (dla dynamicznych VIP-ów) lub czarną (dla spokojnych stałych bywalców).\n\nReguły klubu są następujące:\n1. Pierwsza osoba w klubie (Korzeń) musi mieć czarną opaskę.\n2. Czerwone opaski są bardzo głośne, więc dwie osoby z czerwonymi opaskami nie mogą stać bezpośrednio obok siebie (rodzic i dziecko nie mogą być naraz czerwoni).\n3. Bez względu na to, którą ścieżką pójdziesz przez klub do wyjścia awaryjnego (liścia), musisz minąć dokładnie taką samą liczbę osób w czarnych opaskach.\n\nIf do klubu wchodzi nowy gość, ochroniarz przydziela mu czerwoną opaskę. Jeśli zasady zostaną złamane (np. czerwony stanie obok czerwonego), ochroniarze szybko każą niektórym osobom zamienić kolory opasek (recoloring) lub delikatnie przesuwają ludzi w kolejce (rotacja).\n\nTa zabawa w kolory sprawia, że żadna część klubu nigdy nie jest zbyt zatłoczona ani pusta. Klub jest zawsze stabilny, a obsługa może dotrzeć do każdego gościa w mgnieniu oka!",
    pseudocode: `recolor and rotate to maintain RBT properties`,
  },
  trie: {
    theory:
      "A Trie (Prefix Tree) is an ordered tree used to store a dynamic set of strings, where keys are usually strings.",
    theory_pl:
      "Drzewo Trie (wywodzące się od słowa retrieval, choć często wymawiane jak „try”), nazywane również drzewem prefiksowym, to wysoce zoptymalizowana struktura danych służąca do przechowywania i szybkiego wyszukiwania łańcuchów znaków (tekstów) w dynamicznym zbiorze. Pomysł opisu tej struktury pochodzi od René de la Briandais (1959), a samą nazwę zaproponował Edward Fredkin w 1960 roku.\n\nW drzewie Trie klucze nie są przechowywane bezpośrednio w węzłach. Zamiast tego pozycja węzła w drzewie definiuje powiązany z nim klucz.\nCharakterystyka struktury:\n- Korzeń reprezentuje pusty ciąg znaków.\n- Każdy węzeł potomny odpowiada pojedynczemu znakowi (np. literze alfabetu).\n- Ścieżka od korzenia do danego węzła tworzy prefiks słowa.\n- Węzły zawierają flagę logiczną określającą, czy dana ścieżka kończy kompletne, poprawne słowo (end of word).\n\nZłożoność obliczeniowa wyszukiwania i wstawiania słowa w drzewie Trie wynosi O(L), gdzie L to długość operowanego słowa. Jest to czas całkowicie niezależny od liczby elementów N przechowywanych w słowniku! To sprawia, że Trie jest niezastąpione w systemach autouzupełniania tekstu (autocomplete), sprawdzania pisowni (spell-checkers) oraz w algorytmach routingu sieciowego.",
    history:
      "First described by René de la Briandais in 1959; the term 'Trie' was coined by Edward Fredkin in 1960.",
    history_pl:
      "Opisane po raz pierwszy przez René de la Briandais w 1959 r.; termin „Trie” wprowadził Edward Fredkin w 1960 r.",
    forDummies:
      "Follow a path of letters to build words—like finding a word in a dictionary letter by letter.",
    forDummies_pl:
      "Wyobraź sobie, że piszesz na smartfonie SMS-a i system autouzupełniania próbuje odgadnąć słowo, które właśnie piszesz. Jak telefon przechowuje tysiące słów w słowniku, by reagować natychmiast po naciśnięciu każdej pojedynczej litery? Używa drzewa Trie!\n\nTrie to jak drzewo decyzyjne w teleturnieju literowym:\n- Korzeń to pustka.\n- Naciskasz literę „K”. Schodzisz po gałęzi oznaczonej literą K.\n- Naciskasz „O”. Schodzisz głębiej do gałęzi O. Widzisz już ścieżkę K-O. Telefon może podpowiedzieć słowo „KOT” (które ma flagę „koniec słowa” na literze T).\n- Dopisujsz „Ł”. Schodzisz do gałęzi Ł. Otrzymujesz ścieżkę K-O-Ł. Telefon widzi, że stąd odchodzą gałęzie do słów „KOŁO”, „KOŁDRA” czy „KOŁYSKA”.\n\nDzięki temu, że słowa o podobnym początku (np. KOT, KOTKA, KOTLECIK) dzielą ten sam początkowy pień (K-O-T), oszczędzamy mnóstwo pamięci na powtarzające się litery. Co najważniejsze, komputer sprawdza słowo litera po literze, więc znalezienie słowa „MAMA” zajmuje mu zawsze dokładnie 4 kroki, nawet jeśli w słowniku są miliardy innych wyrazów!",
    pseudocode: `procedure insert(word):
    for char in word: node = node.child(char)`,
  },
  knapsack: {
    theory:
      "The 0/1 Knapsack problem finds the highest value of items that fit in a weight limit using dynamic programming.",
    theory_pl:
      "Problem plecakowy 0/1 (0/1 Knapsack Problem) to klasyczne zagadnienie optymalizacji kombinatorycznej. Mając dany zestaw przedmiotów, z których każdy ma przypisaną wagę oraz wartość, oraz plecak o ograniczonym udźwigu, należy wybrać taki podzbiór przedmiotów, aby ich łączna wartość była maksymalna, a suma wag nie przekraczała pojemności plecaka. Określenie „0/1” oznacza, że każdy przedmiot jest niepodzielny – możemy go wziąć w całości (1) lub całkowicie go zostawić (0).\n\nProblem ten należy do klasy problemów NP-trudnych. Jednak za pomocą programowania dynamicznego (Dynamic Programming - DP), wprowadzonego przez Richarda Bellmana w latach 50. XX wieku, możemy go rozwiązać w czasie pseudowielomianowym przy użyciu tablicy pamięci podręcznej.\n\nTworzymy dwuwymiarową tablicę DP o rozmiarze (N+1) x (W+1), gdzie N to liczba przedmiotów, a W to pojemność plecaka. Komórka dp[i][w] przechowuje maksymalną wartość, jaką można uzyskać, mając do dyspozycji pierwsze i przedmiotów i limit wagi w. Równanie rekurencyjne definiuje się następująco:\n- Jeśli waga przedmiotu i przekracza limit w: dp[i][w] = dp[i-1][w] (nie możemy go wziąć).\n- W przeciwnym razie wybieramy wartość maksymalną z dwóch opcji: pozostawienia przedmiotu lub jego zabrania:\n  dp[i][w] = max(dp[i-1][w], wartość[i] + dp[i-1][w - waga[i]])\n\nZłożoność obliczeniowa tego podejścia wynosi O(N * W), a złożoność pamięciowa to również O(N * W) (którą można zoptymalizować do O(W) przy użyciu jednowymiarowej tablicy).",
    history:
      "Formally pioneered by George Dantzig; solved using DP by Richard Bellman in the 1950s.",
    history_pl:
      "Sformalizowany przez George'a Dantziga; rozwiązany przy użyciu programowania dynamicznego przez Richarda Bellmana w latach 50.",
    forDummies:
      "A burglar choosing the most expensive items to put in a bag without exceeding the weight limit.",
    forDummies_pl:
      "Wyobraź sobie, że jesteś włamywaczem, który zakradł się w nocy do jubilera. Masz plecak, który może udźwignąć maksymalnie 5 kg – jeśli zapakujesz więcej, plecak pęknie i zostaniesz złapany. Na półce leżą trzy unikalne przedmioty:\n1. Złoty wazon (waga: 4 kg, wartość: 4000 zł)\n2. Srebrna taca (waga: 3 kg, wartość: 3000 zł)\n3. Diamentowy pierścień (waga: 2 kg, wartość: 3000 zł)\n\nNie możesz odciąć kawałka tacy ani wazonu (decyzja 0/1). Jeśli zachowasz się zachłannie i weźmiesz wazon (najcenniejszy, 4000 zł), zapełnisz prawie cały plecak (zostaje 1 kg wolnego miejsca) i nie zmieścisz już nic więcej. Twój łup to 4000 zł.\n\nAlgorytm programowania dynamicznego rozwiązuje to systematycznie. Buduje tabelkę w notatniku, w której linijka po linijce sprawdza każdą możliwą pojemność plecaka (1kg, 2kg, 3kg, 4kg, 5kg) i podejmuje optymalną decyzję dla każdego przedmiotu na podstawie wcześniejszych wyników. Dzięki temu komputer szybko odkryje, że znacznie lepiej jest zignorować ciężki wazon, a spakować tacę (3 kg) oraz pierścień (2 kg). Suma ich wag wynosi dokładnie 5 kg, a łączna wartość to aż 6000 zł!\n\nProgramowanie dynamiczne to właśnie taka super-inteligentna ściągawka, która chroni nas przed błędami pochopnych decyzji!",
    pseudocode: `dp[i][w] = max(val[i] + dp[i-1][w-wt[i]], dp[i-1][w])`,
  },
  lcs: {
    theory:
      "Longest Common Subsequence (LCS) finds the longest sequence present in two strings in the same relative order.",
    theory_pl:
      "Problem Najdłuższego Wspólnego Podciągu (Longest Common Subsequence - LCS) to klasyczne zagadnienie teorii sekwencji i algorytmiki. Celem jest znalezienie podciągu o maksymalnej długości, który występuje w dwóch zadanych ciągach znaków (tekstach) w tej samej względnej kolejności, przy czym elementy podciągu nie muszą sąsiadować bezpośrednio ze sobą (w przeciwieństwie do wspólnego spójnego fragmentu tekstu - substring).\n\nZagadnienie to rozwiązuje się za pomocą programowania dynamicznego. Tworzymy dwuwymiarową matrycę DP o wymiarach (M+1) x (N+1), gdzie M i N to długości obu tekstów. Komórka dp[i][j] przechowuje długość najdłuższego wspólnego podciągu dla początkowych fragmentów tekstów o długościach odpowiednio i oraz j.\n\nReguła przejścia dla komórki wygląda następująco:\n- Jeśli litery na końcach bieżących podciągów są identyczne (X[i-1] == Y[j-1]):\n  dp[i][j] = dp[i-1][j-1] + 1 (wydłużamy dotychczasowy podciąg).\n- Jeśli litery się różnią:\n  dp[i][j] = max(dp[i-1][j], dp[i][j-1]) (dziedziczymy najlepszy wynik z sąsiednich stanów).\n\nZłożoność obliczeniowa i pamięciowa algorytmu wynosi O(M * N). Algorytm ten jest absolutnym fundamentem działania programów do porównywania plików tekstowych (narzędzia typu diff oraz systemy kontroli wersji, np. git diff), a także odgrywa kluczową rolę w bioinformatyce do analizy sekwencji DNA i białek.",
    history:
      "Published in 1974 by Wagner and Fischer for string correction and foundational to the 'diff' utility.",
    history_pl:
      "Opublikowany w 1974 roku przez Wagnera i Fischera na potrzeby korekty tekstów; fundament działania narzędzia „diff”.",
    forDummies:
      "Finding the longest shared list of favorite movies between two friends' collections.",
    forDummies_pl:
      "Wyobraź sobie, że dwójka przyjaciół, Kasia i Tomek, spisuje na kartkach listy swoich ulubionych filmów. Chcą sprawdzić, jak bardzo pokrywają się ich filmowe gusty.\nKasia napisała: [Avatar, Batman, Cars, Dune]\nTomek napisał: [Batman, Avatar, Dune, Cars]\n\nNajdłuższy wspólny podciąg (LCS) szuka najdłuższego zestawu filmów, które oboje lubią i wymienili w tej samej kolejności chronologicznej (nawet jeśli pomiędzy nimi są inne tytuły).\n- Jeśli wybierzemy [Batman, Dune], długość wynosi 2.\n- Jeśli wybierzemy [Avatar, Cars], również 2.\nKomputer znajduje to, rysując tabelkę krzyżową w pamięci. Porównuje każdy film Kasi z każdym filmem Tomka. Krok po kroku zlicza punkty:\n- Jeśli filmy są identyczne, dodaje 1 punkt do wyniku ukośnego.\n- Jeśli się różnią, przepisuje większą wartość z góry lub z lewej strony.\n\nNa koniec, odczytując drogę powrotną z tabelki, komputer bezbłędnie wskaże optymalną serię wspólnych zainteresowań. To klucz do porównywania wszystkiego – od plików z kodem programisty, po kody genetyczne w laboratoriach medycznych!",
    pseudocode: `if X[i] == Y[j]: dp[i][j] = dp[i-1][j-1] + 1`,
  },
  "flood-fill": {
    theory:
      "Flood Fill determines connected areas in a grid, used for bucket-fill tools in graphics editors.",
    theory_pl:
      "Algorytm Flood Fill (wypełnianie zalewowe), potocznie nazywany algorytmem wiadra z farbą, służy do wyznaczania i transformacji spójnych obszarów w wielowymiarowych strukturach danych, najczęściej w dwuwymiarowych siatkach pikseli. Jest to bezpośrednia adaptacja algorytmów przeszukiwania grafów – BFS lub DFS.\n\nAlgorytm rozpoczyna działanie od określonego punktu startowego (ziarna - seed) o zadanym kolorze początkowym.\nPrzebieg procesu:\n1. Odczytaj kolor punktu startowego. Jeśli jest on identyczny z kolorem docelowym, natychmiast zakończ pracę (zapobiega to nieskończonej pętli).\n2. Zmień kolor bieżącego punktu na kolor docelowy.\n3. Rekurencyjnie (DFS) lub za pomocą kolejki (BFS) wywołaj procedurę dla wszystkich sąsiadujących pikseli (zazwyczaj w sąsiedztwie 4-kierunkowym: góra, dół, lewo, prawo, lub 8-kierunkowym, uwzględniającym ukosy), które posiadają oryginalny kolor początkowy.\n\nWersja rekurencyjna (DFS) cechuje się prostotą kodu, lecz przy bardzo dużych obrazach grozi przepełnieniem stosu (stack overflow). Wersje produkcyjne zazwyczaj korzystają z kolejki (BFS) i optymalizacji linia-po-linii (scanline flood fill). Złożoność obliczeniowa wynosi O(N), gdzie N to liczba pikseli w spójnym obszarze, a złożoność pamięciowa to O(N) na utrzymanie struktur sterujących.",
    history:
      "Derived from graph traversals; became famous through early digital painting software in the 1970s.",
    history_pl:
      "Wywodzi się z przeszukiwania grafów; stał się sławny dzięki wczesnym programom do malowania cyfrowego w latach 70.",
    forDummies:
      "Spilling paint on a canvas and watching it fill a closed shape until it hits a border.",
    forDummies_pl:
      "Wyobraź sobie, że otwierasz program MS Paint, rysujesz czarnym pędzlem koło (zamkniętą figurę), a następnie wybierasz ikonę „wiadra z farbą” (Bucket Fill), wybierasz kolor jasnoniebieski i klikasz dokładnie w środek narysowanego koła. Całe koło natychmiast zalewa się kolorem niebieskim, a tło poza kołem pozostaje białe. Jak to się stało?\n\nKomputer uruchamia algorytm zalewowy:\nKrok 1: Patrzysz na piksel, w który kliknąłeś (np. jest on biały). Zmienia jego kolor na niebieski.\nKrok 2: Sprawdza czterech sąsiadów tego piksela (w górę, w dół, w lewo, w prawo).\nKrok 3: Dla każdego sąsiada zadaje pytanie: „Czy jesteś biały?”. Jeśli tak, zmienia jego kolor na niebieski i natychmiast wysyła go do sprawdzenia jego własnych sąsiadów.\nKrok 4: Kiedy fala niebieskiej farby dopłynie do czarnej linii koła, piksele na linii mają kolor czarny, a no biały. Komputer mówi: „O, ty nie jesteś biały, ciebie nie maluję i nie sprawdzam twoich sąsiadów!”. Czarna linia działa jak tama dla rozlanej wody.\n\nW ten sposób farba idealnie rozlewa się po całym dostępnym wolnym obszarze, zatrzymując się precyzyjnie na granicach. Proste, logiczne i niezwykle pomocne!",
    pseudocode: `procedure floodFill(node): if color == target: fill(node); floodFill(neighbors)`,
  },
  "max-heap": {
    theory:
      "A Max Heap is a tree where every parent is greater than or equal to its children, ensuring the max is at the root.",
    theory_pl:
      "Kopiec typu Max (Max-Heap) to wysoce wyspecjalizowana, drzewiasta struktura danych spełniająca warunek kopca. Jest to kompletne drzewo binarne, w którym wartość każdego węzła będącego rodzicem jest większa lub równa wartościom jego węzłów potomnych (dzieci). W rezultacie element o największej wartości w całym kopcu zawsze znajduje się w korzeniu drzewa (indeks 0 w reprezentacji tablicowej).\n\nKopce są powszechnie implementowane za pomocą zwykłych tablic jednowymiarowych, co eliminuje narzut pamięciowy na wskaźniki lewego/prawego dziecka. Relacje rodzic-dziecko oblicza się matematycznie na indeksach:\n- Lewe dziecko węzła o indeksie i znajduje się pod adresem 2*i + 1.\n- Prawe dziecko znajduje się pod adresem 2*i + 2.\n- Rodzic węzła o indeksie i znajduje się pod adresem floor((i-1)/2).\n\nPodstawowe operacje:\n1. Wstawianie (Insert): Nowy element umieszcza się na samym dole kopca (na końcu tablicy), a następnie przywraca się własności kopca, przesuwając element w górę (operacja bubble-up) poprzez sukcesywne zamiany z rodzicem, o ile rodzic jest mniejszy. Złożoność wynosi O(log n).\n2. Usunięcie maksimum (Extract-Max): Usuwamy korzeń, na jego miejsce wstawiamy ostatni element z dołu kopca i spychamy go w dół (operacja sift-down), zamieniając z większym z dzieci, dopóki nie zostanie przywrócony warunek kopca. Złożoność wynosi O(log n).\n\nKopce typu Max są fundamentem działania wydajnych kolejek priorytetowych oraz algorytmu sortowania Heap Sort.",
    history:
      "Incented by Williams in 1964 as part of the Heap Sort algorithm for efficient priority management.",
    history_pl:
      "Wynaleziony przez Williamsa w 1964 roku jako część algorytmu sortowania przez kopcowanie.",
    forDummies:
      "A corporate ladder where the boss is always at the top and every manager is above their subordinates.",
    forDummies_pl:
      "Wyobraź sobie strukturę tradycyjnej firmy (drabiny korporacyjnej) rządzącej się jedną twardą zasadą: „Każdy szef musi zarabiać więcej (lub mieć większe kompetencje) niż jego bezpośredni podwładni”.\n- Na samym szczycie firmy siedzi Prezes (Korzeń). Zarabia najwięcej z całego zespołu.\n- Prezes ma dwóch wiceprezesów. Każdy z nich zarabia mniej od prezesa, ale więcej niż kierownicy pod nimi.\n- Na samym dole drabiny pracują stażyści (Liście).\n\nCo się dzieje, gdy do firmy przychodzi nowy, genialny pracownik (Wstawianie)?\nKrok 1: Zostaje zatrudniony na najniższym stanowisku (na samym dole piramidy).\nKrok 2: Prezes patrzy na jego pensję/umiejętności. Ponieważ nowy pracownik przewyższa swojego kierownika, awansuje i zamienia się z nim miejscami (bubble-up).\nKrok 3: Awansuje tak długo w górę hierarchii, aż trafi na szefa, który zarabia od niego więcej. Tam się zatrzymuje.\n\nA co, jeśli Prezes nagle odejdzie z firmy (Extract-Max)?\nKrok 1: Firma musi szybko obsadzić wolny fotel prezesa. Tymczasowo sadza się tam losowego pracownika z samego dołu drabiny.\nKrok 2: Oczywiście ten pracownik jest zbyt mało kompetentny. Musi „zjechać w dół” hierarchii (sift-down). Jest porównywany ze swoimi dwoma podwładnymi wiceprezesami i ten lepszy z wiceprezesów przejmuje jego fotel, spychając go szczebel niżej.\nKrok 3: Proces trwa, aż nasz tymczasowy prezes trafi na swoje właściwe, sprawiedliwe miejsce.\n\nDzięki temu firma zawsze błyskawicznie wie, kto jest jej absolutnym liderem, i może nim zarządzać w kilka sekund!",
    pseudocode: `while child > parent: swap(child, parent)`,
  },
  "union-find": {
    theory:
      "Union-Find tracks disjoint sets and supports near-constant time merging and membership checks.",
    theory_pl:
      "Struktura zbiorów rozłącznych (Disjoint-Set), powszechnie nazywana algorytmem Union-Find, to niezwykle wydajna struktura danych służąca do reprezentowania i zarządzania podziałem skończonego zbioru elementów na rozłączne podzbiory. Została zaproponowana przez Bernarda Gallera i Michaela Fischera w 1964 roku.\n\nStruktura ta obsługuje dwie kluczowe operacje:\n1. Find: Określa, w którym podzbiorze znajduje się dany element, zwracając tzw. reprezentanta (reprezentującego całą grupę). Pozwala to łatwo sprawdzić, czy dwa elementy należą do tej samej grupy (jeśli ich reprezentanci są identyczni).\n2. Union: Łączy dwa niezależne podzbiory w jeden wspólny zbiór.\n\nWydajność Union-Find zależy od dwóch genialnych optymalizacji:\n- Kompresja ścieżek (Path Compression) w operacji Find: Podczas wyszukiwania reprezentanta, wskaźniki wszystkich odwiedzonych po drodze węzłów są przepinane bezpośrednio do głównego reprezentanta. Dzięki temu kolejne wywołania Find dla tych elementów są wykonywane w czasie stałym O(1).\n- Unia według rangi (Union by Rank/Size): Podczas łączenia grup, mniejsze drzewo jest zawsze podczepiane pod korzeń większego drzewa, co zapobiega powstawaniu zbyt głębokich struktur.\n\nPrzy zastosowaniu obu tych optymalizacji, średni koszt każdej operacji wynosi niemal stałe O(α(n)), gdzie α to odwrotność funkcji Ackermanna. W praktyce funkcja ta dla dowolnych fizycznych danych nie przekracza wartości 4, co oznacza, że algorytm działa w czasie niemal stałym O(1). Jest kluczowy m.in. w algorytmie Kruskala.",
    history:
      "First described by Galler and Fischer in 1964; famous for its incredibly efficient path compression.",
    history_pl:
      "Opisana przez Gallera i Fischera w 1964 roku; znana z niesamowicie wydajnej optymalizacji (kompresja ścieżek).",
    forDummies:
      "Tracking friendship circles at a party and quickly checking if two people belong to the same group.",
    forDummies_pl:
      "Wyobraź sobie wielkie wesele na 200 osób, gdzie na początku nikt nikogo nie zna i każdy siedzi sam. Z czasem ludzie zaczynają rozmawiać, zaprzyjaźniać się i łączyć w grupy znajomych. Chcesz sprawnie zarządzać tymi grupami.\n\nKażda grupa wybiera swojego nieformalnego lidera (Reprezentanta). Jeśli zapytasz kogokolwiek z grupy: „Kto u Was rządzi?”, ta osoba wskaże lidera.\n- Operacja FIND: Pytasz Marka i Kasię: „Kto u Was rządzi?”. Marek mówi: „Janek”. Kasia też mówi: „Janek”. Komputer natychmiast wie: „Marek i Kasia należą do tej samej paczki znajomych”.\n- Operacja UNION: Grupa Janka (3 osoby) zaczyna rozmawiać z grupą Piotra (10 osób). Postanawiają połączyć siły. Aby zachować porządek, mniejsza grupa Janka podchodzi do większej grupy Piotra i Janek ogłasza: „Od teraz Piotr jest naszym wspólnym szefem”. Grupy są połączone.\n\nA na czym polega „kompresja ścieżek”?\nKiedy pytasz kogoś z samego końca grupy o lidera, ta osoba musi pytać swojego kolegę, ten swojego kierownika, aż dojdzie do szefa. Aby nie marnować czasu w przyszłości, po ustaleniu, że szefem jest Piotr, ta osoba od razu zapisuje sobie bezpośredni numer do Piotra. Przy kolejnym pytaniu nie pyta już kolegów pośredników, tylko dzwoni prosto do szefa!\n\nDzięki temu Union-Find potrafi zarządzać milionami grup ludzi i w ułamku sekundy łączyć ich oraz odpowiadać na pytanie: „Czy ci dwaj są w tej samej grupie?”. To niesamowicie sprytna i prosta logika!",
    pseudocode: `procedure find(i): return root of i; procedure union(i, j): join roots`,
  },
};

/**
 * Helper to get education data for an algorithm ID.
 */
export function getAlgorithmEducation(
  id: string,
  lang: "en" | "pl" = "en",
): TranslatedEducation {
  const data = ALGORITHM_EDUCATION[id];
  if (!data)
    return {
      theory: lang === "en" ? "Coming soon" : "Wkrótce dostępne",
      history: lang === "en" ? "Coming soon" : "Wkrótce dostępne",
      forDummies: lang === "en" ? "Coming soon" : "Wkrótce dostępne",
      pseudocode: "// Coming soon",
    };

  return {
    theory: lang === "en" ? data.theory : data.theory_pl,
    history: lang === "en" ? data.history : data.history_pl,
    forDummies: lang === "en" ? data.forDummies : data.forDummies_pl,
    pseudocode: data.pseudocode,
  };
}
